import { useState } from 'react'
import { useCustomers, useCreateCustomer, useDeleteCustomer } from './useCustomers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { Trash2, Plus } from 'lucide-react'

export function CustomersPanel() {
  const { data: customers = [], isLoading } = useCustomers()
  const create = useCreateCustomer()
  const remove = useDeleteCustomer()
  const [open, setOpen] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Customers</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="mr-1 h-4 w-4" />Add Customer</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Customer</DialogTitle></DialogHeader>
            <form onSubmit={async (e) => {
              e.preventDefault()
              try { await create.mutateAsync(new FormData(e.currentTarget)); toast.success('Customer added'); setOpen(false) }
              catch { toast.error('Failed') }
            }} className="space-y-3">
              <div className="space-y-1"><Label>Alt Text</Label><Input name="alt_text" required /></div>
              <div className="space-y-1"><Label>Logo Image</Label><Input name="image" type="file" accept="image/*" /></div>
              <div className="space-y-1"><Label>Or Image URL</Label><Input name="image_url" type="url" /></div>
              <Button type="submit" className="w-full" disabled={create.isPending}>{create.isPending ? 'Adding…' : 'Add'}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {isLoading ? <p className="text-sm text-zinc-500">Loading…</p> : (
        <Table>
          <TableHeader><TableRow><TableHead className="w-16">Logo</TableHead><TableHead>Alt Text</TableHead><TableHead className="w-12"></TableHead></TableRow></TableHeader>
          <TableBody>
            {customers.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.image_url && <img src={c.image_url} alt={c.alt_text} className="h-8 w-12 rounded object-contain" />}</TableCell>
                <TableCell>{c.alt_text}</TableCell>
                <TableCell>
                  <button onClick={async () => {
                    if (!confirm('Delete?')) return
                    try { await remove.mutateAsync(c.id); toast.success('Deleted') }
                    catch { toast.error('Failed') }
                  }} className="text-red-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
