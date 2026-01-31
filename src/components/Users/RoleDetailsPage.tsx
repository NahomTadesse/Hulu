import  { useState, useEffect, useMemo } from 'react';
import { TrashIcon, PlusIcon, ArrowLeftIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { getResources, getRoleResources} from "../../lib/api.ts";
import type {Resource} from "./data.ts";

const MOCK_ROLE_DETAILS = {
    id: 1,
    name: "SUPER_ADMIN",
    description: "SUPER_ADMIN role",
    selectedResources: [
        "schedules/confirm-schedule",
        "settings/terminals",
        "dashboard",
        "organizations",
        "members",
        "vehicle-types",
        "manage-vehicles",
        "vehicle-organization",
    ],
};

const ALL_RESOURCES = [
    "vehicless",
    "users/add",
    "reports/generate",
    "schedules/confirm-schedule",
    "settings/terminals",
    "dashboard",
    "organizations",
    "members",
    "vehicle-types",
    "manage-vehicles",
    "vehicle-organization",
    "invoices/view",
    "inventory/check",
    "system/logs"
];


const RoleDetailsPage = ({ roleId ,roleName, onBack }: { roleId?: number,roleName:string, onBack: () => void }) => {
    const [role, setRole] = useState<any>(null);
    const [selectedResources, setSelectedResources] = useState<string[]>([]);
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchAvailable, setSearchAvailable] = useState('');

    useEffect(() => {
        
        setLoading(true);

        const fetchResources =  async () => {
            const response = await getResources();
            console.log(response);
            if (response.status === 200) {
                const resources = response.data;
                console.log(resources);
                setResources(resources)
                // setUsers(managerUsers);
                setLoading(false);
            }
        };

        const fetchRoleResources =  async () => {
            const response = await getRoleResources(roleName);

            if (response.status === 200) {
                const resources = response.data;
                console.log(resources);
                // setResources(resources)
                // // setUsers(managerUsers);
                // setLoading(false);
            }
        };
        
        // Simulate fetching role details by ID
        setTimeout(() => {
            setRole(MOCK_ROLE_DETAILS);
          //  setSelectedResources(MOCK_ROLE_DETAILS.selectedResources);
            setLoading(false);
        }, 500);


        fetchResources();
        fetchRoleResources();
    }, [roleId]);

    // Filter available resources based on what is NOT already selected and the search term
    const availableResources = useMemo(() => {
        return ALL_RESOURCES.filter(resource =>
            !selectedResources.includes(resource) &&
            resource.toLowerCase().includes(searchAvailable.toLowerCase())
        );
    }, [selectedResources, searchAvailable]);

    const handleSelectResource = (resource: Resource) => {

        setSelectedResources(prev => {
            if (!prev.includes(resource.name)) {
                return [...prev, resource.name].sort();
            }
            return prev;
        });
        setSearchAvailable(''); // Clear search after selection
    };

    const handleRemoveResource = (resourceToRemove: string) => {
        setSelectedResources(prev => prev.filter(r => r !== resourceToRemove));
    };

    const handleSelectAll = () => {
        // Select all resources that are currently NOT selected
        const resourcesToAdd = ALL_RESOURCES.filter(r => !selectedResources.includes(r));
        setSelectedResources(prev => [...prev, ...resourcesToAdd].sort());
    };

    const handleClearAll = () => {
        setSelectedResources([]);
    };

    const handleSave = () => {
        console.log(`Saving permissions for Role ID ${roleId}:`, selectedResources);
        alert(`Permissions saved successfully! Total resources: ${selectedResources.length}`);
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-600">Loading role details...</div>;
    }

    if (!role) {
        return <div className="p-8 text-center text-gray-600">Loading role details...</div>;
    }

    return (
        <div className="p-8 bg-white min-h-screen">

            {/* --- HEADER AND BACK BUTTON --- */}
            <div className="flex items-center mb-6 border-b pb-4">
                <button
                    onClick={onBack}
                    className="flex items-center text-blue-600 hover:text-blue-800 transition mr-6 font-medium"
                >
                    <ArrowLeftIcon className="h-5 w-5 mr-2" />
                    Back
                </button>
                <h1 className="text-3xl font-bold text-gray-900">Roles</h1>
            </div>
            {/* ------------------------------- */}

            {/* --- ROLE INFO --- */}
            <div className="space-y-2 mb-8">
                <p className="text-lg">
                    <span className="font-bold mr-2">Name:</span>
                    {role.name}
                </p>
                <p className="text-lg">
                    <span className="font-bold mr-2">Description:</span>
                    {role.description}
                </p>
            </div>

            {/* --- RESOURCES SECTION --- */}
            <h2 className="text-xl font-bold mb-4">Resources:</h2>

            <div className="grid grid-cols-2 gap-8">

                {/* 1. RESOURCE SELECTION (Left Panel: Available Resources) */}
                <div className="border border-gray-300 rounded-lg p-4 shadow-sm h-full">
                    <div className="relative mb-4">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            value={searchAvailable}
                            onChange={(e) => setSearchAvailable(e.target.value)}
                            placeholder="Search available resource..."
                            className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <div className="h-64 overflow-y-auto space-y-1 pr-2">
                        {resources.length > 0 ? (
                            resources.map((resource: any) => (
                                <div
                                    key={resource}
                                    className="flex justify-between items-center p-2 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer rounded-md transition border-b"
                                    onClick={() => handleSelectResource(resource)}
                                >
                                    {resource.name}
                                    <PlusIcon className="h-4 w-4 text-blue-500" />
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-500 py-4">
                                {searchAvailable ? "No matching resources found." : "All resources selected or list is empty."}
                            </div>
                        )}

                    </div>

                </div>

                {/* 2. SELECTED RESOURCES (Right Panel: Role Permissions) */}
                <div className="border border-gray-300 rounded-lg p-4 shadow-sm">

                    {/* Controls Row */}
                    <div className="flex justify-between items-center mb-4 text-sm font-medium">
                        <button onClick={handleSelectAll} className="text-blue-600 hover:underline disabled:opacity-50" disabled={availableResources.length === 0}>
                            Select all
                        </button>
                        <span className="font-bold text-gray-700">
                            Selected - {selectedResources.length}
                        </span>
                        <button onClick={handleClearAll} className="text-red-600 hover:underline disabled:opacity-50" disabled={selectedResources.length === 0}>
                            Clear all
                        </button>
                    </div>

                    {/* Selected List */}
                    <div className="h-[300px] overflow-y-auto space-y-1 pr-2">
                        {selectedResources.length > 0 ? (
                            selectedResources.map(resource => (
                                <div
                                    key={resource}
                                    className="flex justify-between items-center p-2 border-b text-sm text-gray-800"
                                >
                                    {resource}
                                    <button
                                        onClick={() => handleRemoveResource(resource)}
                                        className="p-1 text-red-500 hover:bg-red-50 rounded-full transition"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-500 py-4">
                                This role has no assigned resources.
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* --- SAVE BUTTON --- */}
            <div className="flex justify-end mt-8">
                <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 transition"
                >
                    Save
                </button>
            </div>
        </div>
    );
};

export default RoleDetailsPage;