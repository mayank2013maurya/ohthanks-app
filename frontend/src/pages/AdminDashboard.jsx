import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { CategoryContext } from '../context/CategoryContext.jsx';
import ProductsDashboard from '../components/admin/ProductsDashboard.jsx';
import CategoriesDashboard from '../components/admin/CategoriesDashboard.jsx';
import UsersDashboard from '../components/admin/UsersDashboard.jsx';
import InquiriesDashboard from '../components/admin/InquiriesDashboard.jsx';
import ReviewsDashboard from '../components/admin/ReviewsDashboard.jsx';
import ContactsDashboard from '../components/admin/ContactsDashboard.jsx';
import NewsletterDashboard from '../components/admin/NewsletterDashboard.jsx';
import LegalEditor from '../components/admin/LegalEditor.jsx';

function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const { fetchCategories } = useContext(CategoryContext);
  const [activeTab, setActiveTab] = useState('products');

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  const tabs = {
    products: { label: 'Products', component: <ProductsDashboard /> },
    categories: { label: 'Categories', component: <CategoriesDashboard /> },
    users: { label: 'Users', component: <UsersDashboard /> },
    inquiries: { label: 'Inquiries', component: <InquiriesDashboard /> },
    reviews: { label: 'Reviews', component: <ReviewsDashboard /> },
    contacts: { label: 'Contacts', component: <ContactsDashboard /> },
    newsletter: { label: 'Newsletter', component: <NewsletterDashboard /> },
    legal: { label: 'Legal Content', component: <LegalEditor /> },
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="flex flex-wrap border-b mb-6">
        {Object.keys(tabs).map(tab => (
          <button
            key={tab}
            className={`px-4 py-2 -mb-px font-medium text-sm sm:text-base ${activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab(tab)}
          >
            {tabs[tab].label}
          </button>
        ))}
      </div>
      <div>
        {tabs[activeTab].component}
      </div>
    </div>
  );
}

export default AdminDashboard; 