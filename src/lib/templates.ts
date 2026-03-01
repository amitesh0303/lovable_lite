import { Template } from '@/types';

export const TEMPLATES: Template[] = [
  {
    id: 'admin-dashboard',
    name: 'Admin Dashboard',
    description: 'A full-featured admin panel with sidebar navigation, data tables, charts, and user management.',
    category: 'Dashboard',
    thumbnail: '📊',
    files: {
      'src/App.tsx': `import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Settings from './pages/Settings';

export default function App() {
  return (
    <Router>
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <main className="flex-1 overflow-auto p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}`,
      'src/components/Sidebar.tsx': `import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/users', label: 'Users', icon: '👥' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function Sidebar() {
  const location = useLocation();
  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold">Admin Panel</h1>
      </div>
      <nav className="flex-1 p-4">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={\`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors \${
              location.pathname === item.path
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }\`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}`,
      'src/pages/Dashboard.tsx': `import React from 'react';

const stats = [
  { label: 'Total Users', value: '2,451', change: '+12%', positive: true },
  { label: 'Revenue', value: '$45,230', change: '+8%', positive: true },
  { label: 'Active Projects', value: '34', change: '+3', positive: true },
  { label: 'Churn Rate', value: '2.4%', change: '-0.5%', positive: true },
];

export default function Dashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
            <p className={\`text-sm mt-2 \${stat.positive ? 'text-green-600' : 'text-red-600'}\`}>
              {stat.change} from last month
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}`,
      'src/pages/Users.tsx': `import React from 'react';

const users = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin', status: 'Active' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'User', status: 'Active' },
  { id: 3, name: 'Carol White', email: 'carol@example.com', role: 'User', status: 'Inactive' },
];

export default function Users() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Users</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Name', 'Email', 'Role', 'Status'].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{user.role}</td>
                <td className="px-6 py-4">
                  <span className={\`px-2 py-1 rounded-full text-xs font-medium \${user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}\`}>
                    {user.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}`,
      'src/pages/Settings.tsx': `import React, { useState } from 'react';

export default function Settings() {
  const [name, setName] = useState('Admin User');
  const [email, setEmail] = useState('admin@example.com');
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-lg">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}`,
    },
  },
  {
    id: 'saas-landing',
    name: 'SaaS Landing Page',
    description: 'A modern SaaS landing page with hero section, features, pricing, and CTA.',
    category: 'Marketing',
    thumbnail: '🚀',
    files: {
      'src/App.tsx': `import React from 'react';
import Header from './components/Header';
import Hero from './sections/Hero';
import Features from './sections/Features';
import Pricing from './sections/Pricing';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <Features />
      <Pricing />
      <Footer />
    </div>
  );
}`,
      'src/components/Header.tsx': `import React from 'react';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-600 rounded-lg" />
          <span className="font-bold text-gray-900 text-xl">YourProduct</span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          {['Features', 'Pricing', 'Blog', 'About'].map((item) => (
            <a key={item} href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">{item}</a>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Sign in</a>
          <a href="#" className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors">
            Get Started Free
          </a>
        </div>
      </div>
    </header>
  );
}`,
      'src/sections/Hero.tsx': `import React from 'react';

export default function Hero() {
  return (
    <section className="pt-32 pb-20 px-4 text-center">
      <div className="max-w-4xl mx-auto">
        <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full mb-6">
          ✨ Now in public beta
        </span>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
          Build faster,<br />
          <span className="text-purple-600">ship smarter</span>
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          The all-in-one platform that helps your team build, launch, and scale your SaaS product 10x faster.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="#" className="px-8 py-4 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors text-lg">
            Start for free
          </a>
          <a href="#" className="px-8 py-4 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-gray-400 transition-colors text-lg">
            Watch demo →
          </a>
        </div>
      </div>
    </section>
  );
}`,
      'src/sections/Features.tsx': `import React from 'react';

const features = [
  { icon: '⚡', title: 'Lightning Fast', description: 'Optimized for performance with sub-second load times.' },
  { icon: '🔒', title: 'Secure by Default', description: 'Enterprise-grade security built into every layer.' },
  { icon: '📊', title: 'Advanced Analytics', description: 'Deep insights into your product usage and growth.' },
  { icon: '🤝', title: 'Team Collaboration', description: 'Work together seamlessly across your entire organization.' },
  { icon: '🔌', title: '200+ Integrations', description: 'Connect with all your favorite tools and services.' },
  { icon: '📱', title: 'Mobile Ready', description: 'Fully responsive on all devices, from day one.' },
];

export default function Features() {
  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything you need</h2>
          <p className="text-xl text-gray-600">All the tools to build a successful product.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f) => (
            <div key={f.title} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-600">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}`,
      'src/sections/Pricing.tsx': `import React from 'react';

const plans = [
  { name: 'Starter', price: '$9', period: '/mo', features: ['5 projects', '10GB storage', 'Basic analytics', 'Email support'], cta: 'Get started', featured: false },
  { name: 'Pro', price: '$29', period: '/mo', features: ['Unlimited projects', '100GB storage', 'Advanced analytics', 'Priority support', 'Custom domains'], cta: 'Get started', featured: true },
  { name: 'Enterprise', price: '$99', period: '/mo', features: ['Everything in Pro', 'SSO & SAML', 'SLA guarantee', 'Dedicated support', 'Custom integrations'], cta: 'Contact sales', featured: false },
];

export default function Pricing() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Simple pricing</h2>
          <p className="text-xl text-gray-600">No hidden fees. Cancel anytime.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div key={plan.name} className={\`rounded-2xl p-8 border \${plan.featured ? 'bg-purple-600 border-purple-600 text-white' : 'bg-white border-gray-200'}\`}>
              <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className={\`ml-1 \${plan.featured ? 'text-purple-200' : 'text-gray-500'}\`}>{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className={\`flex items-center gap-2 \${plan.featured ? 'text-purple-100' : 'text-gray-600'}\`}>
                    <span>✓</span><span>{f}</span>
                  </li>
                ))}
              </ul>
              <a href="#" className={\`block text-center py-3 px-6 rounded-xl font-semibold transition-colors \${plan.featured ? 'bg-white text-purple-600 hover:bg-purple-50' : 'bg-purple-600 text-white hover:bg-purple-700'}\`}>
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}`,
      'src/components/Footer.tsx': `import React from 'react';

export default function Footer() {
  return (
    <footer className="py-12 px-4 border-t border-gray-200">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center gap-2 mb-4 md:mb-0">
          <div className="w-6 h-6 bg-purple-600 rounded" />
          <span className="font-bold text-gray-900">YourProduct</span>
        </div>
        <p className="text-sm text-gray-500">© 2024 YourProduct. All rights reserved.</p>
      </div>
    </footer>
  );
}`,
    },
  },
  {
    id: 'client-portal',
    name: 'Client Portal',
    description: 'A secure client portal with login, profile, project tracking, and document sharing.',
    category: 'Portal',
    thumbnail: '🏢',
    files: {
      'src/App.tsx': `import React, { useState } from 'react';
import Login from './pages/Login';
import Portal from './pages/Portal';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  return isLoggedIn ? <Portal onLogout={() => setIsLoggedIn(false)} /> : <Login onLogin={() => setIsLoggedIn(true)} />;
}`,
      'src/pages/Login.tsx': `import React, { useState } from 'react';

interface LoginProps { onLogin: () => void; }

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white text-2xl">🏢</div>
          <h1 className="text-2xl font-bold text-gray-900">Client Portal</h1>
          <p className="text-gray-500 mt-1">Sign in to your account</p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button onClick={onLogin}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors">
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}`,
      'src/pages/Portal.tsx': `import React, { useState } from 'react';

interface PortalProps { onLogout: () => void; }

const projects = [
  { id: 1, name: 'Website Redesign', status: 'In Progress', progress: 65, due: 'Dec 15, 2024' },
  { id: 2, name: 'Mobile App', status: 'Planning', progress: 20, due: 'Jan 30, 2025' },
  { id: 3, name: 'API Integration', status: 'Completed', progress: 100, due: 'Nov 1, 2024' },
];

export default function Portal({ onLogout }: PortalProps) {
  const [activeTab, setActiveTab] = useState('projects');
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">🏢</div>
          <span className="font-bold text-gray-900">Client Portal</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">John Smith</span>
          <button onClick={onLogout} className="text-sm text-blue-600 hover:text-blue-700">Sign out</button>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          {['projects', 'documents', 'messages'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={\`pb-4 px-2 text-sm font-medium capitalize transition-colors border-b-2 \${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}\`}>
              {tab}
            </button>
          ))}
        </div>
        {activeTab === 'projects' && (
          <div className="space-y-4">
            {projects.map((p) => (
              <div key={p.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">{p.name}</h3>
                  <span className={\`px-3 py-1 rounded-full text-xs font-medium \${p.status === 'Completed' ? 'bg-green-100 text-green-800' : p.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}\`}>{p.status}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: \`\${p.progress}%\` }} />
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{p.progress}% complete</span>
                  <span>Due {p.due}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'documents' && (
          <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
            <div className="text-4xl mb-3">📄</div>
            <p className="text-gray-500">No documents shared yet.</p>
          </div>
        )}
        {activeTab === 'messages' && (
          <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-gray-500">No messages yet.</p>
          </div>
        )}
      </main>
    </div>
  );
}`,
    },
  },
  {
    id: 'crm',
    name: 'CRM Dashboard',
    description: 'A customer relationship management tool with contacts, deals pipeline, and activity tracking.',
    category: 'Business',
    thumbnail: '🤝',
    files: {
      'src/App.tsx': `import React, { useState } from 'react';

const tabs = ['Contacts', 'Deals', 'Activities'];
const contacts = [
  { id: 1, name: 'Alice Brown', company: 'Acme Corp', email: 'alice@acme.com', status: 'Lead', value: '$12,000' },
  { id: 2, name: 'Bob Davis', company: 'TechStart', email: 'bob@techstart.com', status: 'Customer', value: '$45,000' },
  { id: 3, name: 'Carol Lee', company: 'Global Inc', email: 'carol@global.com', status: 'Prospect', value: '$8,500' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('Contacts');
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">🤝 CRM Dashboard</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">+ Add Contact</button>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[{ l: 'Total Contacts', v: '128', c: 'text-blue-600' }, { l: 'Active Deals', v: '$234K', c: 'text-green-600' }, { l: 'Conversion Rate', v: '24%', c: 'text-purple-600' }].map((s) => (
            <div key={s.l} className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
              <p className="text-sm text-gray-500">{s.l}</p>
              <p className={\`text-3xl font-bold mt-1 \${s.c}\`}>{s.v}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mb-4">
          {tabs.map((t) => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={\`px-4 py-2 rounded-lg text-sm font-medium transition-colors \${activeTab === t ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}\`}>{t}</button>
          ))}
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Name', 'Company', 'Email', 'Status', 'Value'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {contacts.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{c.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{c.company}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{c.email}</td>
                  <td className="px-6 py-4"><span className={\`px-2 py-1 rounded-full text-xs font-medium \${c.status === 'Customer' ? 'bg-green-100 text-green-800' : c.status === 'Lead' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}\`}>{c.status}</span></td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{c.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}`,
    },
  },
];
