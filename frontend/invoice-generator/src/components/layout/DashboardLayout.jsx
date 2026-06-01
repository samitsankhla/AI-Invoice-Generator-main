import { useState, useEffect } from 'react';
import { Menu, X, LogOut } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { NAVIGATION_MENU } from '../../utils/data';
import PropfileDropdown from './ProfileDropdown';


const DashboardLayout = ({ children, activeMenu }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeNavItem, setActiveNavItem] = useState('');
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Function to determine active menu item from current path
    const getActiveMenuFromPath = (pathname) => {
        // Remove leading slash
        const path = pathname.substring(1);
        
        // Handle specific routes
        if (path === '' || path === 'dashboard') return 'dashboard';
        if (path.startsWith('invoices')) return 'invoices';
        if (path === 'profile') return 'profile';
        
        // Default fallback
        return path || 'dashboard';
    };

    // Set active nav item based on current location
    useEffect(() => {
        const currentActive = getActiveMenuFromPath(location.pathname);
        setActiveNavItem(currentActive);
    }, [location.pathname]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768); // Example breakpoint for mobile
            if (window.innerWidth >= 1024) {
                setIsSidebarOpen(false); // Close sidebar on larger screens
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Initial check

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // close dropdown when clicking outside (not used in this minimal layout)

    const handleNavigation = (itemId) => {
        setActiveNavItem(itemId);
        navigate(`/${itemId}`);
        if (isMobile) {
            setIsSidebarOpen(false); // Close sidebar on mobile after navigation
        }
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const sidebarCollapsed = !isMobile && false; // Implement collapse logic if needed

    return (
        <div className="flex min-h-screen h-screen bg-gray-50">
            {/* Mobile sidebar overlay */}
            {isMobile && isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-white/30 backdrop-blur-sm z-40 transition-opacity duration-300"
                    onClick={toggleSidebar}
                />
            )}
            {/* Sidebar */}
            <aside
                className={`
                    w-64 bg-white border-r border-gray-200 flex flex-col justify-between py-6 px-4
                    fixed md:static z-50 h-screen min-h-screen overflow-y-auto
                    transition-transform duration-300 ease-in-out
                    ${isMobile ? (isSidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
                `}
                style={{ minWidth: 256 }}
            >
                <div>
                    <div className="flex items-center mb-10">
                        <div className="w-9 h-9 bg-blue-900 rounded-md flex items-center justify-center mr-2">
                            <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><rect width="22" height="22" rx="4" fill="#fff"/><rect x="3" y="3" width="16" height="16" rx="4" fill="#1e3a8a"/><rect x="7" y="7" width="8" height="8" rx="2" fill="#fff"/></svg>
                        </div>
                        <span className="font-bold text-lg text-gray-900">AI Invoice App</span>
                        {isMobile && (
                            <button
                                className="ml-auto p-2 text-gray-500 hover:text-blue-900"
                                onClick={toggleSidebar}
                                aria-label="Close sidebar"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        )}
                    </div>
                    <nav className="flex flex-col gap-1">
                        {NAVIGATION_MENU.map((item) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleNavigation(item.id)}
                                    className={`flex items-center w-full px-3 py-2 rounded-lg text-left transition-colors duration-150 ${activeNavItem === item.id ? 'bg-blue-50 text-blue-900 font-semibold' : 'text-gray-700 hover:bg-gray-100'}`}
                                >
                                    <Icon className="w-5 h-5 mr-3" />
                                    {item.name}
                                </button>
                            );
                        })}
                    </nav>
                </div>
                <button
                    onClick={logout}
                    className="flex items-center px-3 py-2 rounded-lg text-gray-500 hover:text-blue-900 hover:bg-gray-100 transition-colors duration-150 mt-8"
                >
                    <LogOut className="w-5 h-5 mr-2" /> Logout
                </button>
            </aside>

            {/* Main content */}
            <div className={`flex-1 h-screen overflow-y-auto ${isMobile ? '' : ''}`}>
                {/* Topbar */}
                <header className="h-16 flex items-center px-8 border-b border-gray-200 bg-white sticky top-0 z-20">
                    {isMobile && (
                        <button
                            className="mr-4 p-2 text-gray-500 hover:text-blue-900"
                            onClick={toggleSidebar}
                            aria-label="Open sidebar"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                    )}
                    <div className="flex-1">
                        <h2 className="text-lg font-semibold text-gray-900">Welcome back, {user?.name?.split(' ')[0] || 'User'}!</h2>
                        <p className="text-sm text-gray-500">Here's your invoice overview.</p>
                    </div>

                    <div className="flex items-center space-x-3">
                        {/* Profile Dropdown */}
                        <PropfileDropdown
                            isOpen={profileDropdownOpen}
                            onToggle={() => setProfileDropdownOpen(!profileDropdownOpen)}
                            avatar={user?.avatar || null}
                            companyName={user?.companyName || user?.name || 'Company Name'}
                            email={user?.email || 'Email Address'}
                            onLogout={() => { logout(); setProfileDropdownOpen(false); }}
                        />
                    </div>
                </header>
                <main className="p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default DashboardLayout