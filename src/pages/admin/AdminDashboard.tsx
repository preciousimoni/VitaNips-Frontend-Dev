// src/pages/admin/AdminDashboard.tsx
import React, { useEffect, useState } from 'react';
import { getAdminStats, AdminStats } from '../../api/admin';
import StatCard from '../../components/admin/StatCard';
import { FaUsers, FaUserMd, FaClinicMedical } from 'react-icons/fa';

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getAdminStats();
                setStats(data);
            } catch (err) {
                setError('Failed to fetch admin statistics.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return <div className="text-center p-8">Loading dashboard...</div>;
    }

    if (error) {
        return <div className="text-center p-8 text-red-500">{error}</div>;
    }

    if (!stats) {
        return <div className="text-center p-8">No statistics available.</div>;
    }

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.users && (
                    <StatCard
                        icon={<FaUsers className="text-4xl text-blue-500" />}
                        title="Users"
                        value={stats.users.total}
                        details={[
                            { label: 'Active', value: stats.users.active },
                            { label: 'New This Month', value: stats.users.new_this_month },
                        ]}
                    />
                )}
                {stats.doctors && (
                    <StatCard
                        icon={<FaUserMd className="text-4xl text-green-500" />}
                        title="Doctors"
                        value={stats.doctors.total}
                        details={[
                            { label: 'Verified', value: stats.doctors.verified },
                            { label: 'Pending Verification', value: stats.doctors.pending_verification },
                        ]}
                    />
                )}
                {stats.pharmacies && (
                    <StatCard
                        icon={<FaClinicMedical className="text-4xl text-purple-500" />}
                        title="Pharmacies"
                        value={stats.pharmacies.total}
                        details={[
                            { label: 'Active', value: stats.pharmacies.active },
                            { label: 'Inactive', value: stats.pharmacies.inactive },
                        ]}
                    />
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
