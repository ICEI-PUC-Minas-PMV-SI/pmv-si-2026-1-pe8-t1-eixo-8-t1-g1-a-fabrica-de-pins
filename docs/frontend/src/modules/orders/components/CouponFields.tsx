import type { Control } from 'react-hook-form'

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type {
  CouponCreateInput,
  CouponCreateValues,
} from '@/schemas/coupon.schema'
import { cn } from '@/utils/cn'

type CouponFieldsProps = {
  control: Control<CouponCreateInput, unknown, CouponCreateValues>
}

export function CouponFields({ control }: CouponFieldsProps) {
  return (
    <>
      <FormField
        control={control}
        name="codigo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Código</FormLabel>
            <FormControl>
              <Input placeholder="Ex.: GANHOU10" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="ativo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ativo</FormLabel>
            <Select
              onValueChange={(v) => field.onChange(v === 'sim')}
              value={field.value ? 'sim' : 'nao'}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="sim">Sim</SelectItem>
                <SelectItem value="nao">Não</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="valorDesconto"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Valor do desconto</FormLabel>
            <FormControl>
              <Input type="number" min={0.01} step={0.01} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="tipoDesconto"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="PERCENTUAL">Percentual (%)</SelectItem>
                <SelectItem value="FIXO">Valor fixo (R$)</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="dataValidade"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Validade</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="quantidadeMinimaItens"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Qtd. mínima de itens</FormLabel>
            <FormControl>
              <Input type="number" min={0} step={1} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="valorMinimoPedido"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Valor mínimo do pedido (R$)</FormLabel>
            <FormControl>
              <Input type="number" min={0} step={0.01} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="limiteUsos"
        render={({ field }) => (
          <FormItem className={cn('md:col-span-2')}>
            <FormLabel>Limite de usos</FormLabel>
            <FormControl>
              <Input type="number" min={0} step={1} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )
}
