import { useState, useEffect } from "react";
import {   PencilSquareIcon, TrashIcon, UserGroupIcon } from '@heroicons/react/24/outline';

import RoleDetailsPage from './RoleDetailsPage';
import { getRoles} from "../../lib/api.ts";

// --- MOCK DATA ---
// const MOCK_ROLES = [
//     { id: 1, name: "SUPER_ADMIN", description: "SUPER_ADMIN role" },
//     { id: 2, name: "ADMIN", description: "admin role" },
//     { id: 3, name: "MANAGER", description: "Managerial role for reporting" },
//     { id: 4, name: "STAFF", description: "Standard user role for daily operations" },
// ];

const ManageRolesPage = () => {

    const [roles, setRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'details'>('list');

    const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);

    // FIX 1: Change type to string | null because names are strings, not numbers
    const [selectedRoleName, setSelectedRoleName] = useState<string | null>(null);

    // ... useEffect remains the same ...

    // const handleViewDetails = (r: any) => {
    //     setSelectedRoleId(r.id);
    //     setSelectedRoleName(r.name); // Store the actual name string
    //     setView('details');
    // };

    const handleBackToList = () => {
        setSelectedRoleId(null);
        setSelectedRoleName(null);
        setView('list');
    };

    if (view === 'details' && selectedRoleId !== null) {
        return (
            <RoleDetailsPage
                roleId={selectedRoleId}
                // FIX 2: Pass the variable (string), NOT the setter function
                roleName={selectedRoleName ?? ""}
                onBack={handleBackToList}
            />
        );
    }


    // const [roles, setRoles] = useState<any[]>([]);
    // const [loading, setLoading] = useState(true);
    //
    // const [view, setView] = useState<'list' | 'details'>('list');
    //
    // const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
    // const [selectedRoleName, setSelectedRoleName] = useState<number | null>(null);

    useEffect(() => {

        setLoading(true);

        const fetchRoles =  async () => {
            const response = await getRoles();
            console.log(response);
            if (response.status === 200) {
                const resources = response.data;
                console.log(resources);
                setRoles(resources)
                // setUsers(managerUsers);
                setLoading(false);
            }
        };



        // Simulate API call to fetch roles
        // setLoading(true);
        // setTimeout(() => {
        //     setRoles(MOCK_ROLES);
        //     setLoading(false);
        // }, 500);

        fetchRoles();

    }, []);

    // --- VIEW HANDLERS ---

    // 💡 Function to switch to the details view
    // const handleViewDetails = (r:any) => {
    //     setSelectedRoleId(r.id);
    //     setSelectedRoleName(r.name);
    //     setView('details');
    // };

    // 💡 Function to switch back to the list view
    // const handleBackToList = () => {
    //     setSelectedRoleId(null);
    //     setView('list');
    // };


    const handleEdit = (roleId: number) => {
        alert(`Editing role ID: ${roleId}`);
    };

    const handleDelete = (roleId: number) => {
        if (window.confirm(`Are you sure you want to delete role ID: ${roleId}?`)) {
            setRoles(roles.filter(role => role.id !== roleId));
            alert(`Role ID ${roleId} deleted.`);
        }
    };


    if (view === 'details' && selectedRoleId !== null) {
        return (
            <RoleDetailsPage
                roleId={selectedRoleId}
                roleName={selectedRoleName?? ""}
                onBack={handleBackToList} // Pass the handler to switch back
            />
        );
    }

    return (
        <div className="p-8 bg-gray-50 min-h-screen">

            {/* --- HEADER --- */}
            <div className="mb-6 border-b pb-4">
                <div className="flex items-center">
                    <UserGroupIcon className="h-8 w-8 text-gray-900 mr-3" />
                    <h1 className="text-3xl font-bold text-gray-900">Roles</h1>
                </div>
            </div>

            <div className="bg-white shadow-xl rounded-xl border border-gray-200 overflow-hidden w-full">

                {/* --- CREATE BUTTON --- */}
                {/*<div className="p-4 border-b border-gray-100">*/}
                {/*    <button*/}
                {/*        onClick={handleCreate}*/}
                {/*        className="flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md shadow-md hover:bg-blue-700 transition"*/}
                {/*    >*/}
                {/*        <PlusIcon className="h-5 w-5 mr-2" />*/}
                {/*        Create*/}
                {/*    </button>*/}
                {/*</div>*/}

                {/* --- ROLES TABLE --- */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 w-full">
                        <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">#</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Name <span className="ml-1 text-gray-400">↑↓</span></th>

                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-40">Actions <span className="ml-1 text-gray-400">↑↓</span></th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500">Loading roles...</td></tr>
                        ) : (roles &&
                            roles.map((role) => (
                                <tr key={role.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{role.id}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{role.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2">
                                            {/* 💡 Eye Icon calls the new handler */}
                                            {/*<button*/}
                                            {/*    onClick={() => handleViewDetails(role)}*/}
                                            {/*    className="p-1 border border-blue-300 text-blue-500 bg-blue-50 rounded-md hover:bg-blue-100 transition"*/}
                                            {/*    title="View"*/}
                                            {/*>*/}
                                            {/*    <EyeIcon className="h-4 w-4" />*/}
                                            {/*</button>*/}
                                            {/* Edit Button */}
                                            <button
                                                onClick={() => handleEdit(role.id)}
                                                className="p-1 border border-orange-300 text-orange-500 bg-orange-50 rounded-md hover:bg-orange-100 transition"
                                                title="Edit"
                                            >
                                                <PencilSquareIcon className="h-4 w-4" />
                                            </button>
                                            {/* Delete Button */}
                                            <button
                                                onClick={() => handleDelete(role.id)}
                                                className="p-1 border border-red-300 text-red-500 bg-red-50 rounded-md hover:bg-red-100 transition"
                                                title="Delete"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManageRolesPage;






























// import { useState, useEffect } from "react";
// import { PlusIcon, EyeIcon, PencilSquareIcon, TrashIcon, UserGroupIcon } from '@heroicons/react/24/outline';
//
// // --- MOCK DATA ---
// const MOCK_ROLES = [
//     { id: 1, name: "SUPER_ADMIN", description: "SUPER_ADMIN role" },
//     { id: 2, name: "ADMIN", description: "admin role" },
//     { id: 3, name: "MANAGER", description: "Managerial role for reporting" },
//     { id: 4, name: "STAFF", description: "Standard user role for daily operations" },
// ];
//
// const ManageRolesPage = () => {
//     const [roles, setRoles] = useState<any[]>([]);
//     const [loading, setLoading] = useState(true);
//
//     useEffect(() => {
//         // Simulate API call to fetch roles
//         setLoading(true);
//         setTimeout(() => {
//             setRoles(MOCK_ROLES);
//             setLoading(false);
//         }, 500);
//     }, []);
//
//     // --- Action Handlers (Placeholders) ---
//     const handleCreate = () => {
//         alert("Navigating to Role Creation form...");
//     };
//
//     const handleView = (roleId: number) => {
//         alert(`Viewing role ID: ${roleId}`);
//     };
//
//     const handleEdit = (roleId: number) => {
//         alert(`Editing role ID: ${roleId}`);
//     };
//
//     const handleDelete = (roleId: number) => {
//         if (window.confirm(`Are you sure you want to delete role ID: ${roleId}?`)) {
//             // Simulate deletion API call
//             setRoles(roles.filter(role => role.id !== roleId));
//             alert(`Role ID ${roleId} deleted.`);
//         }
//     };
//
//     // --- JSX Render ---
//     return (
//         <div className="p-8 bg-gray-50 min-h-screen">
//
//             {/* --- HEADER --- */}
//             <div className="mb-6 border-b pb-4">
//                 <div className="flex items-center">
//                     <UserGroupIcon className="h-8 w-8 text-gray-900 mr-3" />
//                     <h1 className="text-3xl font-bold text-gray-900">Roles</h1>
//                 </div>
//             </div>
//             {/* ----------------- */}
//
//             {/* 💡 The container now uses w-full to span the entire content area */}
//             <div className="bg-white shadow-xl rounded-xl border border-gray-200 overflow-hidden w-full">
//
//                 {/* --- CREATE BUTTON --- */}
//                 <div className="p-4 border-b border-gray-100">
//                     <button
//                         onClick={handleCreate}
//                         className="flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md shadow-md hover:bg-blue-700 transition"
//                     >
//                         <PlusIcon className="h-5 w-5 mr-2" />
//                         Create
//                     </button>
//                 </div>
//
//                 {/* --- ROLES TABLE --- */}
//                 <div className="overflow-x-auto">
//                     <table className="min-w-full divide-y divide-gray-200 w-full">
//                         <thead className="bg-gray-50">
//                         <tr>
//                             <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
//                                 #
//                             </th>
//                             <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
//                                 Name
//                                 <span className="ml-1 text-gray-400">↑↓</span>
//                             </th>
//                             <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/2">
//                                 Description
//                                 <span className="ml-1 text-gray-400">↑↓</span>
//                             </th>
//                             <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
//                                 Actions
//                                 <span className="ml-1 text-gray-400">↑↓</span>
//                             </th>
//                         </tr>
//                         </thead>
//                         <tbody className="bg-white divide-y divide-gray-100">
//                         {loading ? (
//                             <tr>
//                                 <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
//                                     Loading roles...
//                                 </td>
//                             </tr>
//                         ) : (
//                             roles.map((role) => (
//                                 <tr key={role.id}>
//                                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                                         {role.id}
//                                     </td>
//                                     <td className="px-6 py-4 text-sm font-medium text-gray-900">
//                                         {role.name}
//                                     </td>
//                                     <td className="px-6 py-4 text-sm text-gray-500">
//                                         {role.description}
//                                     </td>
//                                     <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                                         <div className="flex justify-end space-x-2">
//                                             {/* View Button */}
//                                             <button
//                                                 onClick={() => handleView(role.id)}
//                                                 className="p-1 border border-blue-300 text-blue-500 bg-blue-50 rounded-md hover:bg-blue-100 transition"
//                                                 title="View"
//                                             >
//                                                 <EyeIcon className="h-4 w-4" />
//                                             </button>
//                                             {/* Edit Button */}
//                                             <button
//                                                 onClick={() => handleEdit(role.id)}
//                                                 className="p-1 border border-orange-300 text-orange-500 bg-orange-50 rounded-md hover:bg-orange-100 transition"
//                                                 title="Edit"
//                                             >
//                                                 <PencilSquareIcon className="h-4 w-4" />
//                                             </button>
//                                             {/* Delete Button */}
//                                             <button
//                                                 onClick={() => handleDelete(role.id)}
//                                                 className="p-1 border border-red-300 text-red-500 bg-red-50 rounded-md hover:bg-red-100 transition"
//                                                 title="Delete"
//                                             >
//                                                 <TrashIcon className="h-4 w-4" />
//                                             </button>
//                                         </div>
//                                     </td>
//                                 </tr>
//                             ))
//                         )}
//                         </tbody>
//                     </table>
//                 </div>
//                 {/* ----------------------- */}
//
//             </div>
//         </div>
//     );
// };
//
// export default ManageRolesPage;