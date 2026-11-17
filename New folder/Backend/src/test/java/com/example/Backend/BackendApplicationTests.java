package com.example.Backend;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
class BackendApplicationTests {

	@Autowired
	private MockMvc mockMvc;

	@Test
	void contextLoads() {
	}

	@Test
	void warehouseApiRequiresAuthentication() throws Exception {
		mockMvc.perform(get("/api/products"))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void administratorCanLogInAndLogOutWithCsrfProtection() throws Exception {
		MvcResult csrfResult = mockMvc.perform(get("/api/auth/csrf"))
				.andExpect(status().isOk())
				.andReturn();
		Cookie csrfCookie = csrfResult.getResponse().getCookie("XSRF-TOKEN");
		String csrfToken = csrfCookie.getValue();

		MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
				.cookie(csrfCookie)
				.header("X-XSRF-TOKEN", csrfToken)
				.contentType(MediaType.APPLICATION_FORM_URLENCODED)
				.param("username", "test-admin")
				.param("password", "test-password-at-least-12"))
				.andExpect(status().isNoContent())
				.andReturn();
		MockHttpSession session = (MockHttpSession) loginResult.getRequest().getSession(false);

		mockMvc.perform(get("/api/auth/me").session(session))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.username").value("test-admin"));

		MvcResult logoutCsrfResult = mockMvc.perform(get("/api/auth/csrf").session(session))
				.andExpect(status().isOk())
				.andReturn();
		mockMvc.perform(post("/api/auth/logout")
				.session(session)
				.cookie(logoutCsrfResult.getResponse().getCookie("XSRF-TOKEN"))
				.header("X-XSRF-TOKEN", logoutCsrfResult.getResponse().getCookie("XSRF-TOKEN").getValue()))
				.andExpect(status().isNoContent());

		mockMvc.perform(get("/api/auth/me").session(session))
				.andExpect(status().isUnauthorized());
	}
}
