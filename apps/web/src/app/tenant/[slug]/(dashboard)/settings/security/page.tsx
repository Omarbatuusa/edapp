'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamic import for Map to avoid SSR issues
const GeoZoneMap = dynamic(() => import('../../../../../../components/security/GeoZoneMap'), {
    ssr: false,
    loading: () => <div className="h-[400px] w-full bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">Loading Map...</div>
});

interface Branch {
    id: string;
    branch_name: string;
    lat: number;
    lng: number;
    geofence_radius_m: number;
    geo_required_for_staff: boolean;
    geo_required_for_learners: boolean;
    geo_min_accuracy_m: number;
    geo_policy_mode: string;
    allowed_public_ips: string[];
    ip_policy_mode: string;
    allow_ip_autodetect: boolean;
}

export default function SecuritySettingsPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [branches, setBranches] = useState<Branch[]>([]);
    const [selectedBranchId, setSelectedBranchId] = useState<string>('');
    const [branch, setBranch] = useState<Branch | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'location' | 'network'>('location');
    const [newIp, setNewIp] = useState('');
    const [myIp, setMyIp] = useState('');

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

    useEffect(() => {
        fetchBranches();
        fetchMyIp();
    }, []);

    useEffect(() => {
        if (selectedBranchId) {
            fetchBranchDetails(selectedBranchId);
        }
    }, [selectedBranchId]);

    const fetchBranches = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/security-settings/branches`, {
                headers: { 'x-tenant-id': slug }
            });
            if (res.ok) {
                const data = await res.json();
                setBranches(data);
                if (data.length > 0) setSelectedBranchId(data[0].id);
            }
        } catch (e) {
            console.error('Failed to fetch branches', e);
        } finally {
            setLoading(false);
        }
    };

    const fetchBranchDetails = async (id: string) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/security-settings/branch/${id}`, {
                headers: { 'x-tenant-id': slug }
            });
            if (res.ok) {
                const data = await res.json();
                // Ensure array exists
                if (!data.allowed_public_ips) data.allowed_public_ips = [];
                setBranch(data);
            }
        } catch (e) {
            console.error('Failed to fetch branch details', e);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyIp = async () => {
        try {
            const res = await fetch(`${API_URL}/security-settings/my-ip`);
            if (res.ok) {
                const data = await res.json();
                setMyIp(data.ip);
            }
        } catch (e) {
            console.error('Failed to get IP', e);
        }
    };

    const saveBranch = async () => {
        if (!branch) return;
        try {
            await fetch(`${API_URL}/security-settings/branch/${branch.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-tenant-id': slug
                },
                body: JSON.stringify(branch)
            });
            alert('Settings saved successfully');
        } catch (e) {
            alert('Failed to save settings');
        }
    };

    const handleLocationChange = (lat: number, lng: number) => {
        if (branch) setBranch({ ...branch, lat, lng });
    };

    const addIp = () => {
        if (newIp && branch) {
            const updatedIps = [...(branch.allowed_public_ips || []), newIp];
            setBranch({ ...branch, allowed_public_ips: updatedIps });
            setNewIp('');
        }
    };

    const removeIp = (ipToRemove: string) => {
        if (branch) {
            const updatedIps = branch.allowed_public_ips.filter(ip => ip !== ipToRemove);
            setBranch({ ...branch, allowed_public_ips: updatedIps });
        }
    };

    if (loading && !branch) return <div className="p-8">Loading...</div>;

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Security Settings</h1>

            {/* Branch Selector */}
            <div className="mb-6">
                <label className="block text-sm font-medium mb-1">Select Branch</label>
                <select
                    className="border rounded p-2 w-64"
                    value={selectedBranchId}
                    onChange={(e) => setSelectedBranchId(e.target.value)}
                >
                    {branches.map(b => (
                        <option key={b.id} value={b.id}>{b.branch_name}</option>
                    ))}
                </select>
            </div>

            {/* Tabs */}
            <div className="flex space-x-4 mb-6 border-b">
                <button
                    className={`pb-2 px-4 ${activeTab === 'location' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('location')}
                >
                    Location & Geo-Fencing
                </button>
                <button
                    className={`pb-2 px-4 ${activeTab === 'network' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('network')}
                >
                    Network & IP Security
                </button>
            </div>

            {branch && activeTab === 'location' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Map Column */}
                        <div className="lg:col-span-2">
                            <label className="block text-sm font-medium mb-2">Branch Location & Geo-Fence</label>
                            <div className="border rounded-lg shadow-sm">
                                <GeoZoneMap
                                    lat={branch.lat}
                                    lng={branch.lng}
                                    radius={branch.geofence_radius_m}
                                    editable={true}
                                    onLocationChange={handleLocationChange}
                                />
                            </div>
                            <p className="text-sm text-gray-500 mt-2">Click on the map to set the branch center.</p>
                        </div>

                        {/* Controls Column */}
                        <div className="space-y-6">
                            <div className="bg-white p-4 rounded-lg border shadow-sm">
                                <h3 className="font-semibold mb-4">Configuration</h3>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-1">Enforcement Mode</label>
                                    <select
                                        className="w-full border rounded p-2"
                                        value={branch.geo_policy_mode}
                                        onChange={(e) => setBranch({ ...branch, geo_policy_mode: e.target.value })}
                                    >
                                        <option value="OFF">Off</option>
                                        <option value="WARN">Warn (Log only)</option>
                                        <option value="ENFORCE">Enforce (Block)</option>
                                    </select>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-1">Fence Radius (meters)</label>
                                    <input
                                        type="range"
                                        min="10"
                                        max="500"
                                        step="10"
                                        className="w-full"
                                        value={branch.geofence_radius_m}
                                        onChange={(e) => setBranch({ ...branch, geofence_radius_m: parseInt(e.target.value) })}
                                    />
                                    <div className="text-right text-sm text-gray-600">{branch.geofence_radius_m}m</div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-1">Min Accuracy (meters)</label>
                                    <input
                                        type="number"
                                        className="w-full border rounded p-2"
                                        value={branch.geo_min_accuracy_m}
                                        onChange={(e) => setBranch({ ...branch, geo_min_accuracy_m: parseInt(e.target.value) })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={branch.geo_required_for_staff}
                                            onChange={(e) => setBranch({ ...branch, geo_required_for_staff: e.target.checked })}
                                        />
                                        <span className="text-sm">Required for Staff</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={branch.geo_required_for_learners}
                                            onChange={(e) => setBranch({ ...branch, geo_required_for_learners: e.target.checked })}
                                        />
                                        <span className="text-sm">Required for Learners</span>
                                    </label>
                                </div>
                            </div>

                            <button
                                onClick={saveBranch}
                                className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {branch && activeTab === 'network' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white p-6 rounded-lg shadow border max-w-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold">IP Address Allowlist</h2>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium">Mode:</span>
                                <select
                                    className="border rounded p-1 text-sm"
                                    value={branch.ip_policy_mode}
                                    onChange={(e) => setBranch({ ...branch, ip_policy_mode: e.target.value })}
                                >
                                    <option value="OFF">Off</option>
                                    <option value="WARN">Warn</option>
                                    <option value="ENFORCE">Enforce</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                className="flex-1 border rounded p-2"
                                placeholder="Enter IP Address (e.g. 203.0.113.1)"
                                value={newIp}
                                onChange={(e) => setNewIp(e.target.value)}
                            />
                            <button
                                onClick={addIp}
                                className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
                            >
                                Add
                            </button>
                        </div>

                        <div className="mb-6 flex justify-between items-center bg-blue-50 p-3 rounded border border-blue-100">
                            <div className="text-sm text-blue-800">
                                Your current IP: <span className="font-mono font-bold">{myIp || 'Loading...'}</span>
                            </div>
                            <button
                                onClick={() => setNewIp(myIp)}
                                className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                            >
                                Use My IP
                            </button>
                        </div>

                        <div className="space-y-2">
                            {branch.allowed_public_ips?.length === 0 && (
                                <p className="text-gray-500 italic text-sm">No IPs allowed. Policy logic (Off/Warn/Enforce) determines access.</p>
                            )}
                            {branch.allowed_public_ips?.map(ip => (
                                <div key={ip} className="flex justify-between items-center p-3 bg-gray-50 rounded border">
                                    <span className="font-mono text-sm">{ip}</span>
                                    <button
                                        onClick={() => removeIp(ip)}
                                        className="text-red-600 hover:text-red-800 text-sm"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 border-t pt-4">
                            <label className="flex items-center space-x-2 mb-4">
                                <input
                                    type="checkbox"
                                    checked={branch.allow_ip_autodetect}
                                    onChange={(e) => setBranch({ ...branch, allow_ip_autodetect: e.target.checked })}
                                />
                                <span className="text-sm">Allow Auto-Detect via Magic Link (Mobile App)</span>
                            </label>

                            <button
                                onClick={saveBranch}
                                className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                            >
                                Save Network Settings
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
