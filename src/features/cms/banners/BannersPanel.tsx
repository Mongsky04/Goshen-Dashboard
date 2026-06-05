import { useState } from 'react'
import { useBanners, useCreateBanner, useDeleteBanner } from './useBanners'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { Trash2, Plus } from 'lucide-react'

export function BannersPanel() {
  const { data: banners = [], isLoading } = useBanners()
  const create = useCreateBanner()
  const remove = useDeleteBanner()
  const [open, setOpen] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Banners</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="mr-1 h-4 w-4" />Upload Banner</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Upload Banner</DialogTitle></DialogHeader>
            <form onSubmit={async (e) => {
              e.preventDefault()
              try { await create.mutateAsync(new FormData(e.currentTarget)); toast.success('Banner uploaded'); setOpen(false) }
              catch { toast.error('Failed') }
            }} className="space-y-3">
              <div className="space-y-1"><Label>Name</Label><Input name="name" required /></div>
              <div className="space-y-1"><Label>Image</Label><Input name="image" type="file" accept="image/*" /></div>
              <div className="space-y-1"><Label>Or Image URL</Label><Input name="image_url" type="url" /></div>
              <div className="space-y-1"><Label>Sort Order</Label><Input name="sort_order" type="number" defaultValue="0" /></div>
              <Button type="submit" className="w-full" disabled={create.isPending}>{create.isPending ? 'Uploading…' : 'Upload'}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {isLoading ? <p className="text-sm text-zinc-500">Loading…</p> : (
        <Table>
          <TableHeader><TableRow><TableHead className="w-24">Preview</TableHead><TableHead>Name</TableHead><TableHead>Order</TableHead><TableHead className="w-12"></TableHead></TableRow></TableHeader>
          <TableBody>
            {banners.map((b) => (
              <TableRow key={b.id}>
                <TableCell><img src={b.image_url} alt={b.name} className="h-10 w-20 rounded object-cover" /></TableCell>
                <TableCell className="font-medium">{b.name}</TableCell>
                <TableCell>{b.sort_order}</TableCell>
                <TableCell>
                  <button onClick={async () => {
                    if (!confirm('Delete?')) return
                    try { await remove.mutateAsync(b.id); toast.success('Deleted') }
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
