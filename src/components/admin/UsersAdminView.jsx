import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { UserSummaryView } from '../user/UserSummaryView';

export function UsersAdminView({ user }) {
    const isAdmin = user?.role === 'admin' || user?.role === 'supervisor';
    if (!isAdmin) return null;

    const [usersById, setUsersById] = useState({});
    const [selectedUser, setSelectedUser] = useState('');
    const [loading, setLoading] = useState(true);

    /* =====================
       Load users
    ===================== */

    useEffect(() => {
        const loadUsers = async () => {
            setLoading(true);

            const usersSnap = await getDocs(collection(db, 'users'));
            const users = {};

            usersSnap.forEach(doc => {
                users[doc.id] = doc.data();
            });

            setUsersById(users);
            setLoading(false);
        };

        loadUsers();
    }, []);

    /* =====================
       Render
    ===================== */

    if (loading) {
        return (
            <div className="text-sm text-neutral-400">
                Cargando usuarios…
            </div>
        );
    }

    return (
        <div className="h-full flex justify-center">
            <div className="w-full max-w-3xl flex flex-col gap-4">

                {/* User selector */}
                <div>
                    <label className="block text-xs text-neutral-400 mb-1">
                        Usuario
                    </label>

                    <select
                        value={selectedUser}
                        onChange={e => setSelectedUser(e.target.value)}
                        className="
                            w-full bg-neutral-800
                            border border-neutral-700
                            rounded-lg px-3 py-2 text-sm
                        "
                    >
                        <option value="">
                            — Selecciona un usuario —
                        </option>

                        {Object.entries(usersById).map(([uid, u]) => (
                            <option key={uid} value={uid}>
                                {u.displayName ?? u.email}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Summary */}
                {selectedUser && (
                    <UserSummaryView userId={selectedUser} />
                )}
            </div>
        </div>
    );
}
