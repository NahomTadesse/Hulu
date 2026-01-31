import React, { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import type {UserFormProps,Data} from "./data.ts";
import {getRoles, updateUser} from "../../lib/api.ts";

const UserForm = ({ user, onSave, onCancel }: UserFormProps) => {
    const isEditing = !!user;
    const [roles, setRoles] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        id: user?.id || null,
        name: user?.name || '',
        email: user?.email || '',
        phoneNumber: user?.phoneNumber || '',
        roleId: user?.roleId ,
        password: '',
    });

    // Only update form data if a new user object is passed (for reset/switching)
    useEffect(() => {

        const fetchRoles =  async () => {
            const response = await getRoles();
            console.log(response);
            if (response.status === 200) {
                const resources = response.data;
                console.log(resources);
                setRoles(resources)

            }
        };


        if (user) {
            setFormData({
                id: user.id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                roleId: user.roleId!,
                password: '', // Clear password field on edit load
            });
        }


        fetchRoles();
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value,
        }));
    };

    // const handleSubmit = (e: FormEvent) => {
    //     e.preventDefault();
    //
    //     // Basic validation: Password required for new users
    //     if (!isEditing && !formData.password) {
    //         alert("Password is required for new users.");
    //         return;
    //     }
    //
    //     // Prepare data for submission (strip password if not set during edit)
    //     const dataToSave = { ...formData };
    //     if (isEditing && !dataToSave.password) {
    //         delete dataToSave.password;
    //     }
    //
    //     onSave(dataToSave);
    // };

    // const handleSubmit = (e: FormEvent) => {
    //     e.preventDefault();
    //
    //     if (!isEditing && !formData.password) {
    //         alert("Password is required for new users.");
    //         return;
    //     }
    //
    //     let { password, ...dataToSave } = formData;
    //
    //     if (!isEditing || password) {
    //         dataToSave = { ...dataToSave, password } as any;
    //     }
    //
    //     onSave(dataToSave);
    // };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!isEditing && !formData.password) {
            alert("Password is required for new users.");
            return;
        }

        // 1. Destructure using const to satisfy ESLint
        // 2. We use 'any' or a spread to satisfy the Data type requirement
        const { password, id, ...rest } = formData;

        // Ensure ID is treated as a string to satisfy the 'Data' interface
        const dataToSave: Data = {
            ...rest,
            id: id || "", // Convert null to empty string or handle as needed
        };

        // If there is a password (new user or changing it), add it back
        // We cast to 'any' here because your Data interface doesn't include password
        const finalPayload = password
            ? { ...dataToSave, password } as any
            : dataToSave;

        await updateUser(id, dataToSave);

        onSave(finalPayload);
    };


    return (
        <div className="max-w-xl mx-auto bg-white p-8 shadow-2xl rounded-xl border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {isEditing ? `Edit User: ${user.name}` : 'Add New User'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">

                {/* Name */}
                <div className="space-y-1">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        id="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Enter full name"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                </div>

                {/* Email */}
                <div className="space-y-1">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
                    <input
                        type="email"
                        id="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="Enter email address"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                </div>

                {/* Phone Number */}
                <div className="space-y-1">
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Phone Number <span className="text-red-500">*</span></label>
                    <input
                        type="tel"
                        id="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        required
                        placeholder="e.g., 555-1234"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                </div>

                {/* Role and Password in one row */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Role */}
                    <div className="space-y-1">
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                        <select
                            id="role"
                            value={formData.roleId}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white outline-none"
                        >
                            { roles &&
                            roles.map((role) => (
                            <option value={role.id}>{role.name}</option>
                                ))}
                            {/*// <option value="ADMIN">ADMIN</option>*/}
                            {/*// <option value="MANAGER">MANAGER</option>*/}
                            {/*// <option value="STAFF">STAFF</option>*/}
                        </select>
                    </div>

                    {/* Password */}
                    <div className="space-y-1">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password {isEditing ? '(Change only)' : <span className="text-red-500">*</span>}
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={formData.password}
                            onChange={handleChange}
                            required={!isEditing} // Required only for new users
                            placeholder={isEditing ? 'Leave blank to keep existing' : 'Enter password'}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition"
                    >
                        {isEditing ? 'Save Changes' : 'Create User'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UserForm;