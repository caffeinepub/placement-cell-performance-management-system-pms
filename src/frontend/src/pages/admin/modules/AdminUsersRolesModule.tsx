import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAssignUserRole } from '../../../hooks/useQueries';
import { Principal } from '@dfinity/principal';
import { UserRole } from '../../../backend';
import { toast } from 'sonner';
import { Shield, UserPlus } from 'lucide-react';

export default function AdminUsersRolesModule() {
  const [principalText, setPrincipalText] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.user);
  const assignRole = useAssignUserRole();

  const handleAssignRole = async () => {
    if (!principalText) {
      toast.error('Please enter a principal ID');
      return;
    }

    try {
      const principal = Principal.fromText(principalText);
      await assignRole.mutateAsync({ user: principal, role: selectedRole });
      toast.success('Role assigned successfully!');
      setPrincipalText('');
    } catch (error) {
      toast.error('Failed to assign role. Please check the principal ID.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Users & Roles</h1>
        <p className="text-muted-foreground mt-1">Manage user access and permissions</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Assign Role Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Assign Role
            </CardTitle>
            <CardDescription>Grant or update user permissions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="principal">User Principal ID</Label>
              <Input
                id="principal"
                value={principalText}
                onChange={(e) => setPrincipalText(e.target.value)}
                placeholder="Enter principal ID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UserRole.admin}>Admin (Full Access)</SelectItem>
                  <SelectItem value={UserRole.user}>User (Limited Access)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAssignRole} disabled={assignRole.isPending} className="w-full">
              {assignRole.isPending ? 'Assigning...' : 'Assign Role'}
            </Button>
          </CardContent>
        </Card>

        {/* Role Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Role Permissions
            </CardTitle>
            <CardDescription>Understanding access levels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Admin / Placement Head / Coordinators</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Full access to all modules</li>
                <li>Manage user roles and permissions</li>
                <li>Create and assign goals</li>
                <li>View all performance data</li>
                <li>Access analytics and reports</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Placement Assistance Team</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>View and update own goals</li>
                <li>Submit self-appraisals</li>
                <li>View and give feedback</li>
                <li>View own competency reports</li>
                <li>Limited to personal data only</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
