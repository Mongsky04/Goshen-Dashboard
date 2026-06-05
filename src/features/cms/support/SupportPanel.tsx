import { useState } from 'react'
import { useSupportCards, useCreateSupportCard, useDeleteSupportCard } from './useSupport'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { Trash2, Plus } from 'lucide-react'

export function SupportPanel() {
  const { data: cards = [], isLoading } = useSupportCards()
  const create = useCreateSupportCard()
  const remove = useDeleteSupportCard()
  const [open, setOpen] = useState(false)

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    try {
      await create.mutateAsync({
        title: fd.get('title') as string,
        description: fd.get('description') as string,
        cta_label: fd.get('cta_label') as string,
        cta_href: fd.get('cta_href') as string,
        sort_order: Number(fd.get('sort_order')) || 0,
      })
      toast.success('Support card created')
      setOpen(false)
    } catch { toast.error('Failed to create') }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Support Cards</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="mr-1 h-4 w-4" />Add Card</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Support Card</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="space-y-1"><Label>Title</Label><Input name="title" required /></div>
              <div className="space-y-1"><Label>Description</Label><Input name="description" /></div>
              <div className="space-y-1"><Label>CTA Label</Label><Input name="cta_label" /></div>
              <div className="space-y-1"><Label>CTA URL</Label><Input name="cta_href" type="url" /></div>
              <div className="space-y-1"><Label>Sort Order</Label><Input name="sort_order" type="number" defaultValue="0" /></div>
              <Button type="submit" className="w-full" disabled={create.isPending}>{create.isPending ? 'Creating…' : 'Create'}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {isLoading ? <p className="text-sm text-zinc-500">Loading…</p> : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead><TableHead>Description</TableHead>
              <TableHead>CTA</TableHead><TableHead>Order</TableHead><TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cards.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.title}</TableCell>
                <TableCell className="text-zinc-500 text-sm max-w-xs truncate">{c.description}</TableCell>
                <TableCell className="text-sm">{c.cta_label}</TableCell>
                <TableCell>{c.sort_order}</TableCell>
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
