
import { useState, useMemo } from 'react';
import { X, Search, Check, User } from 'lucide-react';

export interface PickerUser {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
}

interface UserPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (users: PickerUser[]) => void;
    users: PickerUser[];
    title: string;
    singleSelect?: boolean;
    loading?: boolean;
    alreadyAssignedIds?: string[];
}

export default function UserPickerModal({
    isOpen,
    onClose,
    onSelect,
    users,
    title,
    singleSelect = true,
    loading = false,
    alreadyAssignedIds = []
}: UserPickerModalProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const filteredUsers = useMemo(() => {
        return users.filter(user =>
            (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
            !alreadyAssignedIds.includes(user.id)
        );
    }, [users, searchTerm, alreadyAssignedIds]);

    const handleToggle = (userId: string) => {
        const newSelected = new Set(singleSelect ? [] : selectedIds);
        if (selectedIds.has(userId)) {
            newSelected.delete(userId);
        } else {
            newSelected.add(userId);
        }
        setSelectedIds(newSelected);
    };

    const handleSubmit = () => {
        const selectedUsers = users.filter(u => selectedIds.has(u.id));
        onSelect(selectedUsers);
        onClose();
        setSelectedIds(new Set());
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-80" onClick={onClose} />

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

                <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                {title}
                            </h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Search */}
                        <div className="mb-4 relative">
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        </div>

                        {/* User List */}
                        <div className="max-h-60 overflow-y-auto space-y-2">
                            {loading ? (
                                <div className="text-center py-8 text-gray-500">Loading...</div>
                            ) : filteredUsers.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">No users found.</div>
                            ) : (
                                filteredUsers.map(user => (
                                    <div
                                        key={user.id}
                                        onClick={() => handleToggle(user.id)}
                                        className={`
                                            flex items-center justify-between p-3 rounded-lg cursor-pointer border transition-all
                                            ${selectedIds.has(user.id)
                                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}
                                        `}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                                                <User className="h-4 w-4 text-gray-500 dark:text-gray-300" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                                            </div>
                                        </div>
                                        {selectedIds.has(user.id) && (
                                            <Check className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={selectedIds.size === 0 || loading}
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Add {selectedIds.size > 0 ? `(${selectedIds.size})` : ''}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
