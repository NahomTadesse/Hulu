import { Menu, LogOut } from "lucide-react";
import {useAuth} from "../../security/AuthContext.tsx";

function Header({ onToggleSideBar }: any) {
    const auth = useAuth();

    if (!auth) {
        throw new Error("Header must be used within an AuthProvider");
    }

    const { user, logout } = auth;

    return (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 px-6 py-4">
            <div className="flex items-center justify-between">
                {/* Left Section */}
                <div className="flex items-center space-x-4">
                    <button
                        className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        onClick={onToggleSideBar}
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    <div className="hidden md:block">
                        <h1 className="text-2xl font-black text-slate-800 dark:text-white">
                            Dashboard
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Welcome back, <span className="font-semibold">{user?.username ?? "Guest"}</span>!
                        </p>
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center space-x-3">
            {/*        <button className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">*/}
            {/*            <Sun className="w-5 h-5" />*/}
            {/*        </button>*/}

            {/*        <button className="relative p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">*/}
            {/*            <Bell className="w-5 h-5" />*/}
            {/*            <span className="absolute -top-1 right-0 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">*/}
            {/*  3*/}
            {/*</span>*/}
            {/*        </button>*/}

            {/*        <button className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">*/}
            {/*            <Settings className="w-5 h-5" />*/}
            {/*        </button>*/}

                    {/* User Info + Logout */}
                    <div className="flex items-center space-x-3 pl-3 border-l border-slate-200 dark:border-slate-700">
                        <div className="hidden md:block text-right">
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                {user?.username ?? "Guest"}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {user ? "Admin" : "Not logged in"}
                            </p>
                        </div>

                        {user && (
                            <button
                                onClick={logout}
                                className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-slate-800 transition-colors"
                                title="Logout"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        )}

                        {/*<ChevronDown className="w-4 h-4 text-slate-400" />*/}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Header;
