"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

const clientSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  phone: z.string().min(1, "Le téléphone est requis"),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  photoUrl: z.string().url().optional().or(z.literal("")),
  limiteCredit: z.string().min(0, "La limite doit être positive"),
  status: z.enum(["ACTIVE", "BLOCKED", "LITIGATION"]),
})

type ClientFormData = z.infer<typeof clientSchema>

interface ClientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  client?: any
  onSuccess: () => void
}

export function ClientDialog({
  open,
  onOpenChange,
  client,
  onSuccess,
}: ClientDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      status: "ACTIVE",
      limiteCredit: "0",
    },
  })

  useEffect(() => {
    if (open) {
      if (client) {
        reset({
          name: client.name,
          phone: client.phone,
          email: client.email || "",
          address: client.address || "",
          photoUrl: client.photoUrl || "",
          limiteCredit: client.limiteCredit.toString(),
          status: client.status,
        })
      } else {
        reset({
          name: "",
          phone: "",
          email: "",
          address: "",
          photoUrl: "",
          limiteCredit: "0",
          status: "ACTIVE",
        })
      }
    }
  }, [open, client, reset])

  const onSubmit = async (data: ClientFormData) => {
    setLoading(true)
    try {
      const url = client ? `/api/clients/${client.id}` : "/api/clients"
      const method = client ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          limiteCredit: parseFloat(data.limiteCredit),
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Erreur")
      }

      toast({
        title: client ? "Client modifié" : "Client créé",
        description: `Le client a été ${client ? "modifié" : "créé"} avec succès`,
      })

      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {client ? "Modifier le client" : "Nouveau client"}
          </DialogTitle>
          <DialogDescription>
            {client
              ? "Modifiez les informations du client"
              : "Ajoutez un nouveau client au système"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom *</Label>
              <Input id="name" {...register("name")} />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone *</Label>
              <Input id="phone" {...register("phone")} />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <select
                id="status"
                {...register("status")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="ACTIVE">Actif</option>
                <option value="BLOCKED">Bloqué</option>
                <option value="LITIGATION">Contentieux</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Adresse</Label>
            <Input id="address" {...register("address")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="limiteCredit">Limite de crédit (FCFA)</Label>
              <Input
                id="limiteCredit"
                type="number"
                step="0.01"
                {...register("limiteCredit")}
              />
              {errors.limiteCredit && (
                <p className="text-sm text-destructive">
                  {errors.limiteCredit.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="photoUrl">URL Photo</Label>
              <Input id="photoUrl" type="url" {...register("photoUrl")} />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Enregistrement..." : client ? "Modifier" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}




