import { useState, useEffect } from 'react';
import { Users as UsersIcon, Search, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { getUsers } from '@/lib/users';
import { Input } from '@/components/ui/input';
import { columns } from '@/components/users/columns';
import { DataTable } from '@/components/users/data-table';
import { AdminTable } from './components/admin-table';
import { AdminForm } from './components/admin-form';
import { User } from '@/types';
import { Admin } from '@/types/auth';
import { getAdmins, deleteAdmin, createAdmin } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function Users() {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, adminsData] = await Promise.all([
        getUsers(),
        getAdmins()
      ]);
      setUsers(usersData);
      setAdmins(adminsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const data = await getAdmins();
      setAdmins(data);
    } catch (error) {
      console.error('Error loading admins:', error);
      toast.error('Failed to load administrators');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (data: Omit<Admin, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newAdmin = await createAdmin(data);
      setAdmins(prev => [newAdmin, ...prev]);
      setShowCreateDialog(false);
      toast.success('Administrator added successfully');
    } catch (error) {
      console.error('Error creating admin:', error);
      toast.error('Failed to add administrator');
    }
  };

  const handleDeleteAdmin = async (id: string) => {
    try {
      await deleteAdmin(id);
      setAdmins(prev => prev.filter(admin => admin.id !== id));
      toast.success('Administrator removed successfully');
    } catch (error) {
      console.error('Error deleting admin:', error);
      toast.error('Failed to remove administrator');
    }
  };

  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(search?.toLowerCase() || '') ?? false
  );

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <UsersIcon className="h-12 w-12 text-muted-foreground/50" />
      <h3 className="mt-4 text-lg font-medium">No users yet</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm">
        Users will appear here once they register in the mobile app.
      </p>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <UsersIcon className="h-8 w-8 text-primary/80" />
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Users</h1>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage user accounts and balances
          </p>
        </div>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="admins">Administrators</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6 min-h-[400px]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search users by username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-12 w-full bg-background"
            />
          </div>

          {filteredUsers.length > 0 ? (
            <DataTable columns={columns} data={filteredUsers} />
          ) : (
            renderEmptyState()
          )}
        </TabsContent>

        <TabsContent value="admins" className="space-y-6">
          <div className="rounded-lg border bg-card text-card-foreground p-6">
            <div className="space-y-2 mb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Administrators</h2>
                <Button onClick={() => setShowCreateDialog(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Administrator
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Manage administrator access to the dashboard. Administrators can manage models,
                tasks, and other administrators.
              </p>
            </div>
            <AdminTable
              admins={admins}
              onDeleteAdmin={handleDeleteAdmin}
            />
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Administrator</DialogTitle>
          </DialogHeader>
          <AdminForm
            onSubmit={handleCreateAdmin}
            onCancel={() => setShowCreateDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}