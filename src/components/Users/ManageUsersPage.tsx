import { useState, useEffect } from "react";
import { UserPlusIcon, MagnifyingGlassIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import UserForm from './UserForm';
import {getAllUsers} from "../../lib/api.ts";

const ManageUsersPage = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');


    const [view, setView] = useState<'list' | 'add' | 'edit'>('list');
    const [editingUser, setEditingUser] = useState<any | null>(null);

    useEffect(() => {


        const fetchUsers =  async () => {
            const response = await getAllUsers();
               console.log(response);
            if (response.status === 200) {
                const managerUsers = response.data;
                console.log(managerUsers);
                setUsers(managerUsers);
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatRole = (role: string) => {
        const baseStyle = "px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full";
        switch(role) {
            case 'ADMIN': return <span className={`${baseStyle} bg-red-100 text-red-800`}>Admin</span>;
            case 'MANAGER': return <span className={`${baseStyle} bg-blue-100 text-blue-800`}>Manager</span>;
            case 'STAFF': return <span className={`${baseStyle} bg-green-100 text-green-800`}>Staff</span>;
            default: return <span className={`${baseStyle} bg-gray-100 text-gray-800`}>User</span>;
        }
    };

    // --- Handlers for Add/Edit ---
    const handleAddUser = () => {
        setEditingUser(null);
        setView('add');
    };

    const handleEditUser = (user: any) => {
        setEditingUser(user);
        setView('edit');
    };

    const handleCancel = () => {
        setEditingUser(null);
        setView('list');
    };

    // Placeholder for form submission (You would integrate API calls here)
    const handleSaveUser = (userData: any) => {
        // In a real app, you'd call a POST/PUT API here.
        console.log("Saving user data:", userData);

        // Simulate update/add
        if (userData.id) {
            // Edit existing user
            setUsers(users.map(u => u.id === userData.id ? userData : u));
        } else {
            // Add new user (Simulate new ID)
            const newUser = { ...userData, id: Date.now(), createdAt: new Date().toLocaleDateString() };
            setUsers([newUser, ...users]);
        }

        handleCancel(); // Go back to the list
    };

    // ----------------------------

    if (view !== 'list') {
        return (
            <div className="p-8 bg-gray-50 min-h-screen">
                <div className="flex items-center mb-6">
                    <button onClick={handleCancel} className="flex items-center text-teal-600 hover:text-teal-800 transition">
                        <ArrowLeftIcon className="h-5 w-5 mr-2" />
                        Back to User List
                    </button>
                </div>
                <UserForm
                    user={editingUser}
                    onSave={handleSaveUser}
                    onCancel={handleCancel}
                />
            </div>
        );
    }

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* --- HEADER --- */}
            <div className="flex items-center justify-between mb-6 border-b pb-4">
                <h1 className="text-3xl font-extrabold text-gray-900 flex items-center">
                    <UserPlusIcon className="h-8 w-8 text-teal-600 mr-3" />
                    User Management
                </h1>
                <button
                    onClick={handleAddUser} // 💡 Open Add Form
                    className="flex items-center px-4 py-2 bg-teal-600 text-white font-medium rounded-lg shadow-md hover:bg-teal-700 transition"
                >
                    <UserPlusIcon className="h-5 w-5 mr-2" />
                    Add New User
                </button>
            </div>
            {/* ----------------- */}

            {/* --- TABLE CARD --- */}
            <div className="bg-white shadow-xl rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">System Users ({filteredUsers.length})</h2>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by name, email, or role..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                        />
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan={7} className="px-6 py-4 text-center text-gray-500">Loading users...</td></tr>
                        ) : filteredUsers.length === 0 ? (
                            <tr><td colSpan={7} className="px-6 py-4 text-center text-gray-500">No users found matching "{searchTerm}".</td></tr>
                        ) : (
                            filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-teal-600">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.phoneNumber}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{formatRole(user.role)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleEditUser(user)} // 💡 Open Edit Form
                                            className="text-blue-600 hover:text-blue-900 mr-4"
                                        >
                                            Edit
                                        </button>
                                        <button className="text-red-600 hover:text-red-900">Delete</button>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* ---------------------- */}
        </div>
    );
};
export default ManageUsersPage;





















// import { useState, useEffect } from "react";
// import { UserPlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'; // Assuming you have Heroicons
//
// // --- MOCK DATA ---
// const MOCK_USERS = [
//     { id: 1, name: "Alice Smith", email: "alice@example.com", phoneNumber: "555-1234", role: "ADMIN", createdAt: "2025-10-01" },
//     { id: 2, name: "Bob Johnson", email: "bob@example.com", phoneNumber: "555-5678", role: "MANAGER", createdAt: "2025-10-05" },
//     { id: 3, name: "Charlie Brown", email: "charlie@example.com", phoneNumber: "555-9012", role: "STAFF", createdAt: "2025-10-15" },
//     { id: 4, name: "Diana Prince", email: "diana@example.com", phoneNumber: "555-3456", role: "STAFF", createdAt: "2025-11-01" },
// ];
//
// const ManageUsersPage = () => {
//     const [users, setUsers] = useState<any[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [searchTerm, setSearchTerm] = useState('');
//
//     useEffect(() => {
//         // Simulate API call to fetch users
//         const fetchUsers = () => {
//             setLoading(true);
//             setTimeout(() => {
//                 setUsers(MOCK_USERS);
//                 setLoading(false);
//             }, 800);
//         };
//         fetchUsers();
//     }, []);
//
//     const filteredUsers = users.filter(user =>
//         user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         user.role.toLowerCase().includes(searchTerm.toLowerCase())
//     );
//
//     const formatRole = (role: string) => {
//         const baseStyle = "px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full";
//         switch(role) {
//             case 'ADMIN': return <span className={`${baseStyle} bg-red-100 text-red-800`}>Admin</span>;
//             case 'MANAGER': return <span className={`${baseStyle} bg-blue-100 text-blue-800`}>Manager</span>;
//             case 'STAFF': return <span className={`${baseStyle} bg-green-100 text-green-800`}>Staff</span>;
//             default: return <span className={`${baseStyle} bg-gray-100 text-gray-800`}>User</span>;
//         }
//     };
//
//     return (
//         <div className="p-8 bg-gray-50 min-h-screen">
//             {/* --- HEADER --- */}
//             <div className="flex items-center justify-between mb-6 border-b pb-4">
//                 <h1 className="text-3xl font-extrabold text-gray-900 flex items-center">
//                     <UserPlusIcon className="h-8 w-8 text-teal-600 mr-3" />
//                     User Management
//                 </h1>
//                 <button
//                     className="flex items-center px-4 py-2 bg-teal-600 text-white font-medium rounded-lg shadow-md hover:bg-teal-700 transition"
//                 >
//                     <UserPlusIcon className="h-5 w-5 mr-2" />
//                     Add New User
//                 </button>
//             </div>
//             {/* ----------------- */}
//
//             {/* --- TABLE CARD --- */}
//             <div className="bg-white shadow-xl rounded-xl border border-gray-200 overflow-hidden">
//                 <div className="p-4 border-b border-gray-200 flex justify-between items-center">
//                     <h2 className="text-xl font-semibold text-gray-800">System Users ({filteredUsers.length})</h2>
//                     {/* Search Input */}
//                     <div className="relative">
//                         <input
//                             type="text"
//                             placeholder="Search by name, email, or role..."
//                             value={searchTerm}
//                             onChange={(e) => setSearchTerm(e.target.value)}
//                             className="w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
//                         />
//                         <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//                     </div>
//                 </div>
//
//                 <div className="overflow-x-auto">
//                     <table className="min-w-full divide-y divide-gray-200">
//                         <thead className="bg-gray-50">
//                         <tr>
//                             <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
//                             <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
//                             <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
//                             <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
//                             <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
//                             <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
//                             <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//                         </tr>
//                         </thead>
//                         <tbody className="bg-white divide-y divide-gray-200">
//                         {loading ? (
//                             <tr>
//                                 <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
//                                     Loading users...
//                                 </td>
//                             </tr>
//                         ) : filteredUsers.length === 0 ? (
//                             <tr>
//                                 <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
//                                     No users found matching "{searchTerm}".
//                                 </td>
//                             </tr>
//                         ) : (
//                             filteredUsers.map((user) => (
//                                 <tr key={user.id} className="hover:bg-gray-50">
//                                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.id}</td>
//                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.name}</td>
//                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-teal-600">{user.email}</td>
//                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.phoneNumber}</td>
//                                     <td className="px-6 py-4 whitespace-nowrap text-sm">
//                                         {formatRole(user.role)}
//                                     </td>
//                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                                         {new Date(user.createdAt).toLocaleDateString()}
//                                     </td>
//                                     <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                                         <button className="text-blue-600 hover:text-blue-900 mr-4">Edit</button>
//                                         <button className="text-red-600 hover:text-red-900">Delete</button>
//                                     </td>
//                                 </tr>
//                             ))
//                         )}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>
//             {/* ---------------------- */}
//         </div>
//     );
// };
// export default ManageUsersPage;