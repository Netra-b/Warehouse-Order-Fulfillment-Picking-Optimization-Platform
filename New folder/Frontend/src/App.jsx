import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  Boxes,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Clock3,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Package,
  Pencil,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  Warehouse,
  X,
} from 'lucide-react'
import {
  completePickingTask,
  createOrder,
  createProduct,
  deleteProduct,
  getOrders,
  getPickingTasks,
  getProducts,
  getCurrentUser,
  logout,
  updateProduct,
} from './api'
import LoginPage from './LoginPage'
import './App.css'

const navigation = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: Boxes },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'picking', label: 'Picking lists', icon: ClipboardList },
]

const titles = {
  dashboard: ['Good morning', 'Here’s what’s happening in your warehouse today.'],
  products: ['Products', 'Manage your inventory, locations, and stock levels.'],
  orders: ['Orders', 'Keep customer orders moving from request to dispatch.'],
  picking: ['Picking lists', 'Pick the right items from the right locations.'],
}

const dashboardDate = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
}).format(new Date()).toUpperCase()

function fetchWorkspaceData() {
  return Promise.all([
    getProducts(),
    getOrders(),
    getPickingTasks(),
  ]).then(([products, orders, tasks]) => ({ products, orders, tasks }))
}

const initialData = {
  products: [],
  orders: [],
  tasks: [],
}

function currency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
}

function shortDate(value) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(value))
}

function StatusBadge({ status }) {
  const label = status === 'IN_PROGRESS' ? 'In progress' : status?.toLowerCase().replaceAll('_', ' ')
  return <span className={`status-badge status-${status?.toLowerCase()}`}>{label || 'Unknown'}</span>
}

function App() {
  const [user, setUser] = useState(null)
  const [checkingSession, setCheckingSession] = useState(true)
  const [startupError, setStartupError] = useState('')

  useEffect(() => {
    let active = true
    getCurrentUser()
      .then((currentUser) => {
        if (active) setUser(currentUser)
      })
      .catch((requestError) => {
        if (!active) return
        if (requestError.status !== 401) {
          setStartupError(requestError.status === 502
            ? 'The warehouse API is not responding. Start the backend and refresh.'
            : requestError.message || 'Could not connect to the warehouse service.')
        }
      })
      .finally(() => {
        if (active) setCheckingSession(false)
      })
    return () => { active = false }
  }, [])

  if (checkingSession) {
    return <main className="auth-loading" aria-label="Checking sign-in session"><span /></main>
  }
  if (!user) {
    return (
      <LoginPage
        onLogin={(currentUser) => {
          setStartupError('')
          setUser(currentUser)
        }}
        startupError={startupError}
      />
    )
  }
  return <Workspace user={user} onLogout={() => setUser(null)} />
}

function Workspace({ user, onLogout }) {
  const [activeView, setActiveView] = useState('dashboard')
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [query, setQuery] = useState('')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [modal, setModal] = useState(null)

  const refresh = useCallback(async () => {
    try {
      setData(await fetchWorkspaceData())
      setError('')
    } catch (requestError) {
      setError(requestError.message || 'Could not load warehouse data.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  const refreshInBackground = () => {
    setRefreshing(true)
    refresh()
  }

  const handleLogout = async () => {
    setError('')
    try {
      await logout()
      onLogout()
    } catch (requestError) {
      setError(requestError.message || 'Could not sign out.')
    }
  }

  useEffect(() => {
    let active = true
    fetchWorkspaceData()
      .then((workspaceData) => {
        if (active) {
          setData(workspaceData)
          setError('')
        }
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'Could not load warehouse data.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [])

  const showNotice = (message) => {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 3500)
  }

  const runAction = async (action, successMessage) => {
    setError('')
    try {
      await action()
      setModal(null)
      await refresh()
      showNotice(successMessage)
    } catch (requestError) {
      setError(requestError.message || 'That action could not be completed.')
    }
  }

  const selectedNavigation = navigation.find((item) => item.id === activeView)
  const viewProps = {
    data,
    query,
    setQuery,
    onAddProduct: () => setModal({ type: 'product' }),
    onEditProduct: (product) => setModal({ type: 'product', product }),
    onDeleteProduct: (product) => setModal({ type: 'delete-product', product }),
    onCreateOrder: () => setModal({ type: 'order' }),
    onCompleteTask: (task) => runAction(
      () => completePickingTask(task.id),
      `Item picked for order #${task.orderId}.`,
    ),
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNavOpen ? 'sidebar-open' : ''}`}>
        <a className="brand" href="#" onClick={(event) => event.preventDefault()}>
          <span className="brand-mark"><Warehouse size={20} strokeWidth={2.2} /></span>
          <span>stockroom<span className="brand-period">.</span></span>
        </a>

        <div className="workspace-switcher">
          <span className="workspace-avatar">N</span>
          <span className="workspace-copy"><strong>Northstar Supply</strong><small>Warehouse workspace</small></span>
          <ChevronDown size={16} />
        </div>

        <p className="nav-caption">WORKSPACE</p>
        <nav className="main-nav" aria-label="Main navigation">
          {navigation.map(({ id, label, icon: Icon }) => (
            <button
              className={`nav-item ${activeView === id ? 'nav-item-active' : ''}`}
              key={id}
              onClick={() => {
                setActiveView(id)
                setMobileNavOpen(false)
                setQuery('')
              }}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
              {id === 'picking' && data.tasks.filter((task) => task.status !== 'PICKED').length > 0 && (
                <span className="nav-count">{data.tasks.filter((task) => task.status !== 'PICKED').length}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-help">
            <div className="help-graphic"><Boxes size={20} /></div>
            <strong>Everything in its place.</strong>
            <span>Your warehouse, at a glance.</span>
          </div>
          <div className="user-profile">
            <div className="user-avatar">{user.username.slice(0, 1).toUpperCase()}</div>
            <div className="user-copy"><strong>{user.username}</strong><small>Administrator</small></div>
            <button className="icon-button profile-menu" aria-label="Sign out" title="Sign out" onClick={handleLogout}><LogOut size={16} /></button>
          </div>
        </div>
      </aside>

      {mobileNavOpen && <button className="mobile-backdrop" onClick={() => setMobileNavOpen(false)} aria-label="Close menu" />}

      <main className="main-panel">
        <header className="topbar">
          <button className="icon-button mobile-menu" aria-label="Open menu" onClick={() => setMobileNavOpen(true)}><Menu size={20} /></button>
          <div className="breadcrumb"><span>Workspace</span><ChevronRight size={14} /><strong>{selectedNavigation?.label || 'Dashboard'}</strong></div>
          <div className="topbar-actions">
            <label className="global-search">
              <Search size={16} />
              <input aria-label="Search current view" placeholder={`Search ${selectedNavigation?.label.toLowerCase() || 'workspace'}...`} value={query} onChange={(event) => setQuery(event.target.value)} />
              <kbd>/</kbd>
            </label>
            <button className="icon-button notification-button" aria-label="Notifications"><Bell size={18} /><i /></button>
            <span className="topbar-divider" />
            <span className="today-label"><CalendarDays size={15} /> Today</span>
          </div>
        </header>

        <section className="page-content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">{activeView === 'dashboard' ? dashboardDate : 'WAREHOUSE OVERVIEW'}</div>
              <h1>{titles[activeView][0]}{activeView === 'dashboard' && <span>, {user.username}</span>}</h1>
              <p>{titles[activeView][1]}</p>
            </div>
            <button className="button button-secondary refresh-button" onClick={refreshInBackground} disabled={refreshing}>
              <span className={refreshing ? 'refresh-spin' : ''}>↻</span> Refresh
            </button>
          </div>

          {error && (
            <div className="alert alert-error" role="alert">
              <AlertTriangle size={18} />
              <span><strong>Something went wrong.</strong> {error}</span>
              <button onClick={refreshInBackground} className="text-button">Try again</button>
              <button onClick={() => setError('')} className="icon-button" aria-label="Dismiss error"><X size={16} /></button>
            </div>
          )}

          {loading ? (
            <LoadingState />
          ) : (
            <>
              {activeView === 'dashboard' && <DashboardView {...viewProps} onNavigate={setActiveView} />}
              {activeView === 'products' && <ProductsView {...viewProps} />}
              {activeView === 'orders' && <OrdersView {...viewProps} />}
              {activeView === 'picking' && <PickingView {...viewProps} />}
            </>
          )}
        </section>
        <footer className="app-footer"><span>Stockroom <b>·</b> Warehouse operations made clearer</span><span>All systems operational <i /></span></footer>
      </main>

      {notice && <div className="toast"><CheckCircle2 size={18} />{notice}</div>}
      {modal?.type === 'product' && (
        <ProductModal
          product={modal.product}
          onClose={() => setModal(null)}
          onSubmit={(product) => runAction(
            () => modal.product ? updateProduct(modal.product.id, product) : createProduct(product),
            modal.product ? 'Product details updated.' : 'Product added to inventory.',
          )}
          error={error}
        />
      )}
      {modal?.type === 'order' && (
        <OrderModal
          products={data.products}
          onClose={() => setModal(null)}
          onSubmit={(order) => runAction(() => createOrder(order), 'Order created and added to the picking queue.')}
          error={error}
        />
      )}
      {modal?.type === 'delete-product' && (
        <ConfirmModal
          title="Delete product?"
          message={`This will permanently remove ${modal.product.name} from your catalog. Products attached to existing orders cannot be deleted.`}
          onClose={() => setModal(null)}
          onConfirm={() => runAction(() => deleteProduct(modal.product.id), 'Product removed from inventory.')}
        />
      )}
    </div>
  )
}

function LoadingState() {
  return <div className="loading-grid" aria-label="Loading warehouse data"><div /><div /><div /><div /><div /><div /></div>
}

function MetricCard({ label, value, note, icon: Icon, tone = 'mint', trend }) {
  return (
    <article className="metric-card">
      <div className="metric-top">
        <span className={`metric-icon metric-icon-${tone}`}><Icon size={18} strokeWidth={1.9} /></span>
        {trend && <span className={`metric-trend ${trend.direction === 'down' ? 'trend-down' : ''}`}>{trend.direction === 'down' ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}{trend.text}</span>}
      </div>
      <div className="metric-value">{value}</div>
      <div className="metric-label">{label}</div>
      {note && <div className="metric-note">{note}</div>}
    </article>
  )
}

function DashboardView({ data, onNavigate }) {
  const { products, orders, tasks } = data
  const lowStock = products.filter((product) => product.quantity <= 5)
  const recentOrders = orders.slice(0, 5)
  const pendingOrders = orders.filter((order) => order.status === 'PENDING').length
  const inProgressOrders = orders.filter((order) => order.status === 'IN_PROGRESS').length
  const completedOrders = orders.filter((order) => order.status === 'COMPLETED').length
  const openPickingTasks = tasks.filter((task) => task.status !== 'PICKED').length
  const totalUnits = products.reduce((total, product) => total + Number(product.quantity), 0)
  const inventoryValue = products.reduce(
    (total, product) => total + Number(product.unitPrice) * Number(product.quantity),
    0,
  )
  const maxStatusCount = Math.max(pendingOrders, completedOrders, inProgressOrders, 1)

  return (
    <>
      <div className="metric-grid">
        <MetricCard label="Total products" value={products.length} note="Across all warehouse locations" icon={Boxes} tone="mint" />
        <MetricCard label="Units in stock" value={totalUnits.toLocaleString()} note={`${lowStock.length} products running low`} icon={Package} tone="lavender" />
        <MetricCard label="Open orders" value={pendingOrders + inProgressOrders} note={`${openPickingTasks} items to pick`} icon={ShoppingCart} tone="peach" />
        <MetricCard label="Inventory value" value={currency(inventoryValue)} note="Based on current unit prices" icon={BarChart3} tone="blue" />
      </div>

      <div className="dashboard-grid">
        <section className="panel recent-orders">
          <div className="panel-heading">
            <div><h2>Recent orders</h2><p>A quick look at what’s moving.</p></div>
            <button className="text-link" onClick={() => onNavigate('orders')}>View all <ChevronRight size={15} /></button>
          </div>
          {recentOrders.length ? (
            <div className="table-scroll">
              <table>
                <thead><tr><th>ORDER</th><th>CUSTOMER</th><th>DATE</th><th>ITEMS</th><th>STATUS</th></tr></thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td><strong className="order-number">#{order.id}</strong></td>
                      <td>{order.customerName}</td>
                      <td>{shortDate(order.createdAt)}</td>
                      <td>{order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}</td>
                      <td><StatusBadge status={order.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <EmptyState icon={ShoppingCart} title="No orders yet" message="New customer orders will show up here." />}
        </section>

        <section className="panel fulfillment-panel">
          <div className="panel-heading">
            <div><h2>Order fulfillment</h2><p>Current order status breakdown.</p></div>
            <span className="period-pill">All time <ChevronDown size={13} /></span>
          </div>
          <div className="fulfillment-total"><strong>{orders.length}</strong><span>total orders</span></div>
          <div className="status-bars">
            {[
              ['Pending', pendingOrders, 'bar-pending'],
              ['In progress', inProgressOrders, 'bar-progress'],
              ['Completed', completedOrders, 'bar-completed'],
            ].map(([label, count, barClass]) => (
              <div className="status-bar-row" key={label}>
                <div className="status-bar-label"><span><i className={barClass} />{label}</span><strong>{count}</strong></div>
                <div className="bar-track"><span className={barClass} style={{ width: `${Math.max(count ? (count / maxStatusCount) * 100 : 0, 0)}%` }} /></div>
              </div>
            ))}
          </div>
          <button className="full-width-link" onClick={() => onNavigate('orders')}>View orders <ChevronRight size={15} /></button>
        </section>

        <section className="panel inventory-panel">
          <div className="panel-heading">
            <div><h2>Inventory health</h2><p>Products that may need a restock.</p></div>
            <button className="text-link" onClick={() => onNavigate('products')}>Manage stock <ChevronRight size={15} /></button>
          </div>
          {lowStock.length ? (
            <div className="inventory-alert-list">
              {lowStock.slice(0, 4).map((product) => (
                <div className="inventory-alert" key={product.id}>
                  <span className="product-monogram">{product.name.slice(0, 1).toUpperCase()}</span>
                  <div className="inventory-alert-name"><strong>{product.name}</strong><small>{product.sku} <span>·</span> <MapPin size={11} /> {product.locationCode}</small></div>
                  <span className={`stock-pill ${product.quantity === 0 ? 'stock-empty' : ''}`}>{product.quantity} left</span>
                </div>
              ))}
            </div>
          ) : <div className="healthy-state"><CheckCircle2 size={18} /> All products are at healthy stock levels.</div>}
        </section>

        <section className="panel picking-summary">
          <div className="panel-heading">
            <div><h2>Picking queue</h2><p>Work waiting on the warehouse floor.</p></div>
            <span className="queue-number">{tasks.filter((task) => task.status !== 'PICKED').length}</span>
          </div>
          <div className="queue-summary">
            <div className="queue-icon"><ClipboardList size={20} /></div>
            <div><strong>{tasks.filter((task) => task.status !== 'PICKED').length} items need picking</strong><span>Check locations and complete tasks.</span></div>
          </div>
          <button className="button button-primary button-small" onClick={() => onNavigate('picking')}>Open picking list <ChevronRight size={15} /></button>
        </section>
      </div>
    </>
  )
}

function ProductsView({ data, query, onAddProduct, onEditProduct, onDeleteProduct }) {
  const [stockFilter, setStockFilter] = useState('all')
  const products = useMemo(() => data.products.filter((product) => {
    const matchesText = [product.name, product.sku, product.locationCode].join(' ').toLowerCase().includes(query.toLowerCase())
    return matchesText && (stockFilter === 'all' || (stockFilter === 'low' ? product.quantity <= 5 : product.quantity > 5))
  }), [data.products, query, stockFilter])

  return (
    <section className="panel page-panel">
      <div className="panel-toolbar">
        <div className="filter-tabs">
          {[['all', 'All products'], ['low', 'Low stock'], ['healthy', 'In stock']].map(([value, label]) => (
            <button className={stockFilter === value ? 'filter-tab filter-tab-active' : 'filter-tab'} key={value} onClick={() => setStockFilter(value)}>{label}{value === 'all' && <span>{data.products.length}</span>}</button>
          ))}
        </div>
        <button className="button button-primary" onClick={onAddProduct}><Plus size={16} /> Add product</button>
      </div>
      {products.length ? (
        <div className="table-scroll">
          <table className="products-table">
            <thead><tr><th>PRODUCT</th><th>SKU</th><th>LOCATION</th><th>IN STOCK</th><th>UNIT PRICE</th><th><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>{products.map((product) => (
              <tr key={product.id}>
                <td><div className="product-cell"><span className="product-monogram">{product.name.slice(0, 1).toUpperCase()}</span><strong>{product.name}</strong></div></td>
                <td><span className="code-text">{product.sku}</span></td>
                <td><span className="location-cell"><MapPin size={13} />{product.locationCode}</span></td>
                <td><span className={`quantity-cell ${product.quantity <= 5 ? 'quantity-low' : ''}`}>{product.quantity}<small>{product.quantity <= 5 ? 'Low stock' : 'Available'}</small></span></td>
                <td className="price-cell">{currency(product.unitPrice)}</td>
                <td><div className="row-actions"><button className="icon-button" onClick={() => onEditProduct(product)} aria-label={`Edit ${product.name}`}><Pencil size={15} /></button><button className="icon-button danger-action" onClick={() => onDeleteProduct(product)} aria-label={`Delete ${product.name}`}><Trash2 size={15} /></button></div></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      ) : <EmptyState icon={Package} title="No products found" message={query ? 'Try another search or clear the filter.' : 'Add your first product to start tracking stock.'} />}
      <div className="table-footnote">Showing {products.length} of {data.products.length} products <span>Low stock is 5 units or fewer</span></div>
    </section>
  )
}

function OrdersView({ data, query, onCreateOrder }) {
  const orders = data.orders.filter((order) => `${order.id} ${order.customerName} ${order.status}`.toLowerCase().includes(query.toLowerCase()))
  return (
    <section className="panel page-panel">
      <div className="panel-toolbar">
        <div className="toolbar-copy"><span className="toolbar-count">{data.orders.length}</span><span>customer orders</span></div>
        <button className="button button-primary" onClick={onCreateOrder}><Plus size={16} /> Create order</button>
      </div>
      {orders.length ? (
        <div className="table-scroll">
          <table className="orders-table">
            <thead><tr><th>ORDER</th><th>CUSTOMER</th><th>CREATED</th><th>ITEMS</th><th>ORDER VALUE</th><th>STATUS</th></tr></thead>
            <tbody>{orders.map((order) => {
              const itemsCount = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0
              const total = order.items?.reduce((sum, item) => sum + item.quantity * Number(item.unitPrice), 0) || 0
              return <tr key={order.id}><td><strong className="order-number">#{order.id}</strong></td><td><div className="customer-cell"><span className="customer-avatar">{order.customerName.slice(0, 1).toUpperCase()}</span><strong>{order.customerName}</strong></div></td><td>{shortDate(order.createdAt)}</td><td>{itemsCount} items</td><td className="price-cell">{currency(total)}</td><td><StatusBadge status={order.status} /></td></tr>
            })}</tbody>
          </table>
        </div>
      ) : <EmptyState icon={ShoppingCart} title="No orders found" message={query ? 'Try a different search.' : 'Create an order to start the fulfillment flow.'} />}
      <div className="table-footnote">Orders update as picking tasks are completed.</div>
    </section>
  )
}

function PickingView({ data, onCompleteTask }) {
  const openTasks = data.tasks.filter((task) => task.status !== 'PICKED')
  const completedTasks = data.tasks.filter((task) => task.status === 'PICKED')
  return (
    <>
      <div className="picking-stat-row">
        <div className="picking-stat"><span className="picking-stat-icon task-orange"><Clock3 size={17} /></span><div><strong>{openTasks.length}</strong><span>Open tasks</span></div></div>
        <div className="picking-stat"><span className="picking-stat-icon task-green"><Check size={17} /></span><div><strong>{completedTasks.length}</strong><span>Picked today</span></div></div>
        <div className="picking-stat"><span className="picking-stat-icon task-purple"><ShoppingCart size={17} /></span><div><strong>{new Set(openTasks.map((task) => task.orderId)).size}</strong><span>Orders in queue</span></div></div>
      </div>
      <section className="panel page-panel">
        <div className="panel-heading picking-heading">
          <div><h2>Items to pick</h2><p>Start at the first location and work down the list.</p></div>
          <span className="period-pill"><MapPin size={13} /> Sorted by location</span>
        </div>
        {openTasks.length ? (
          <div className="picking-list">
            {openTasks.map((task, index) => (
              <div className="picking-task" key={task.id}>
                <span className="task-index">{String(index + 1).padStart(2, '0')}</span>
                <span className="task-location"><MapPin size={15} />{task.locationCode}</span>
                <div className="task-product"><strong>{task.productName}</strong><span>{task.sku} <i>·</i> Order #{task.orderId} for {task.customerName}</span></div>
                <span className="task-quantity"><strong>{task.quantityToPick}</strong><small>to pick</small></span>
                <button className="button button-outline button-small" onClick={() => onCompleteTask(task)}><Check size={15} /> Mark picked</button>
              </div>
            ))}
          </div>
        ) : <EmptyState icon={CheckCircle2} title="All caught up" message="There are no items waiting to be picked." />}
      </section>
      {completedTasks.length > 0 && (
        <section className="panel completed-panel">
          <div className="panel-heading"><div><h2>Recently picked</h2><p>Completed tasks stay here for reference.</p></div><span className="completed-count">{completedTasks.length} done</span></div>
          <div className="completed-list">{completedTasks.slice(0, 5).map((task) => <div className="completed-task" key={task.id}><CheckCircle2 size={17} /><strong>{task.productName}</strong><span>{task.locationCode}</span><span>Order #{task.orderId}</span><StatusBadge status={task.status} /></div>)}</div>
        </section>
      )}
    </>
  )
}

function EmptyState({ icon: Icon, title, message }) {
  return <div className="empty-state"><span><Icon size={23} /></span><strong>{title}</strong><p>{message}</p></div>
}

function ProductModal({ product, onClose, onSubmit, error }) {
  const [form, setForm] = useState({
    sku: product?.sku || '',
    name: product?.name || '',
    quantity: product?.quantity ?? 0,
    locationCode: product?.locationCode || '',
    unitPrice: product?.unitPrice ?? 0,
  })
  const [saving, setSaving] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      await onSubmit({ ...form, quantity: Number(form.quantity), unitPrice: Number(form.unitPrice) })
    } finally {
      setSaving(false)
    }
  }
  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))

  return (
    <Modal title={product ? 'Edit product' : 'Add a product'} subtitle="Keep your catalog and stock levels up to date." onClose={onClose}>
      <form className="modal-form" onSubmit={submit}>
        <div className="form-grid">
          <label>Product name<input autoFocus required maxLength="150" value={form.name} onChange={update('name')} placeholder="e.g. Wireless keyboard" /></label>
          <label>SKU<input required maxLength="50" value={form.sku} onChange={update('sku')} placeholder="e.g. KB-101" /></label>
          <label>Location<input required maxLength="30" value={form.locationCode} onChange={update('locationCode')} placeholder="e.g. A-01" /></label>
          <label>Quantity<input required type="number" min="0" step="1" value={form.quantity} onChange={update('quantity')} /></label>
          <label className="form-span">Unit price<input required type="number" min="0" step="0.01" value={form.unitPrice} onChange={update('unitPrice')} /></label>
        </div>
        {error && <div className="form-error"><AlertTriangle size={15} />{error}</div>}
        <div className="modal-actions"><button className="button button-secondary" type="button" onClick={onClose}>Cancel</button><button className="button button-primary" disabled={saving}>{saving ? 'Saving…' : product ? 'Save changes' : 'Add product'}</button></div>
      </form>
    </Modal>
  )
}

function OrderModal({ products, onClose, onSubmit, error }) {
  const [customerName, setCustomerName] = useState('')
  const [productId, setProductId] = useState(products[0]?.id || '')
  const [quantity, setQuantity] = useState(1)
  const [items, setItems] = useState([])
  const [saving, setSaving] = useState(false)
  const availableProducts = products.filter((product) => product.quantity > 0)
  const selectedProduct = products.find((product) => String(product.id) === String(productId))

  const addItem = () => {
    if (!selectedProduct || quantity < 1) return
    setItems((current) => {
      const existing = current.find((item) => item.productId === selectedProduct.id)
      if (existing) return current.map((item) => item.productId === selectedProduct.id ? { ...item, quantity: item.quantity + Number(quantity) } : item)
      return [...current, { productId: selectedProduct.id, quantity: Number(quantity), product: selectedProduct }]
    })
    setQuantity(1)
  }
  const submit = async (event) => {
    event.preventDefault()
    if (!items.length) return
    setSaving(true)
    try {
      await onSubmit({ customerName, items: items.map(({ productId: id, quantity: amount }) => ({ productId: id, quantity: amount })) })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title="Create an order" subtitle="Add items to create a new warehouse picking list." onClose={onClose}>
      <form className="modal-form" onSubmit={submit}>
        <label>Customer name<input autoFocus required maxLength="150" value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="e.g. Acme Studio" /></label>
        <div className="add-order-item">
          <label>Product<select value={productId} onChange={(event) => setProductId(event.target.value)} disabled={!availableProducts.length}><option value="">Select a product</option>{availableProducts.map((product) => <option key={product.id} value={product.id}>{product.name} · {product.quantity} available</option>)}</select></label>
          <label>Qty<input type="number" min="1" step="1" max={selectedProduct?.quantity || undefined} value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} /></label>
          <button className="button button-secondary add-item-button" type="button" onClick={addItem} disabled={!selectedProduct}><Plus size={15} /> Add</button>
        </div>
        {items.length > 0 ? (
          <div className="order-items-list">
            {items.map((item) => <div className="order-item-row" key={item.productId}><span className="product-monogram">{item.product.name.slice(0, 1).toUpperCase()}</span><div><strong>{item.product.name}</strong><small>{item.product.sku}</small></div><span>× {item.quantity}</span><button type="button" className="icon-button danger-action" aria-label={`Remove ${item.product.name}`} onClick={() => setItems((current) => current.filter((entry) => entry.productId !== item.productId))}><X size={15} /></button></div>)}
          </div>
        ) : <div className="order-items-empty">Add at least one product to this order.</div>}
        {error && <div className="form-error"><AlertTriangle size={15} />{error}</div>}
        <div className="modal-actions"><button className="button button-secondary" type="button" onClick={onClose}>Cancel</button><button className="button button-primary" disabled={saving || !items.length}>{saving ? 'Creating…' : 'Create order'}</button></div>
      </form>
    </Modal>
  )
}

function ConfirmModal({ title, message, onClose, onConfirm }) {
  const [saving, setSaving] = useState(false)
  const confirm = async () => {
    setSaving(true)
    try {
      await onConfirm()
    } finally {
      setSaving(false)
    }
  }
  return <Modal title={title} subtitle={message} onClose={onClose}><div className="modal-actions"><button className="button button-secondary" onClick={onClose}>Cancel</button><button className="button button-danger" onClick={confirm} disabled={saving}>{saving ? 'Deleting…' : 'Delete product'}</button></div></Modal>
}

function Modal({ title, subtitle, onClose, children }) {
  useEffect(() => {
    const onKeyDown = (event) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-heading"><div><h2 id="modal-title">{title}</h2><p>{subtitle}</p></div><button className="icon-button" onClick={onClose} aria-label="Close dialog"><X size={18} /></button></div>
        {children}
      </section>
    </div>
  )
}

export default App
