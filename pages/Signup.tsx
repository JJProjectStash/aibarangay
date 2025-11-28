
import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button, Card, CardContent, Input, Label } from '../components/UI';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

interface SignupProps {
    onBack: () => void;
    onSuccess: () => void;
}

const Signup: React.FC<SignupProps> = ({ onBack, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', password: '', confirmPassword: '', address: '', phone: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
        if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
        if (!formData.email.trim()) newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";
        
        if (!formData.password) newErrors.password = "Password is required";
        else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
        else if (!/^(09)\d{9}$/.test(formData.phone)) newErrors.phone = "Must start with 09 and be 11 digits";

        if (!formData.address.trim()) newErrors.address = "Address is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNameChange = (field: 'firstName' | 'lastName', value: string) => {
        // Only allow letters, spaces, dots, and dashes
        if (/^[a-zA-Z\s.-]*$/.test(value)) {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
    };

    const handlePhoneChange = (value: string) => {
        // Only allow numbers, max 11 chars
        const numeric = value.replace(/\D/g, '');
        if (numeric.length <= 11) {
            setFormData(prev => ({ ...prev, phone: numeric }));
        }
    };

    const { showToast } = useToast();
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            await api.register(formData);
            showToast('Success', 'Account created successfully. Please check your email for verification.', 'success');
            onSuccess();
        } catch (err) {
            console.error('Signup failed', err);
            showToast('Error', 'Signup failed. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md my-8">
                <CardContent className="p-8">
                    <button onClick={onBack} className="text-gray-400 hover:text-gray-600 mb-6 flex items-center gap-1 text-sm">
                        <ArrowLeft className="w-4 h-4" /> Back to Login
                    </button>
                    
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
                        <p className="text-gray-500 text-sm">Join your community online.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label required>First Name</Label>
                                <Input 
                                    value={formData.firstName} 
                                    onChange={e => handleNameChange('firstName', e.target.value)} 
                                    error={errors.firstName}
                                    placeholder="Juan"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label required>Last Name</Label>
                                <Input 
                                    value={formData.lastName} 
                                    onChange={e => handleNameChange('lastName', e.target.value)} 
                                    error={errors.lastName}
                                    placeholder="Dela Cruz"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label required>Email</Label>
                            <Input 
                                type="email" 
                                value={formData.email} 
                                onChange={e => setFormData({...formData, email: e.target.value})} 
                                error={errors.email}
                                placeholder="name@email.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label required>Phone Number</Label>
                            <Input 
                                type="tel"
                                placeholder="09123456789"
                                value={formData.phone} 
                                onChange={e => handlePhoneChange(e.target.value)} 
                                error={errors.phone}
                                maxLength={11}
                            />
                        </div>
                         <div className="space-y-2">
                            <Label required>Password</Label>
                            <Input 
                                type="password" 
                                value={formData.password} 
                                onChange={e => setFormData({...formData, password: e.target.value})} 
                                error={errors.password}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label required>Confirm Password</Label>
                            <Input 
                                type="password" 
                                value={formData.confirmPassword} 
                                onChange={e => setFormData({...formData, confirmPassword: e.target.value})} 
                                error={errors.confirmPassword}
                            />
                        </div>
                         <div className="space-y-2">
                            <Label required>Address</Label>
                            <Input 
                                value={formData.address} 
                                onChange={e => setFormData({...formData, address: e.target.value})} 
                                placeholder="Block X Lot Y, Street Name" 
                                error={errors.address}
                            />
                        </div>
                        
                        <Button type="submit" className="w-full mt-6" isLoading={loading}>
                            Sign Up
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default Signup;