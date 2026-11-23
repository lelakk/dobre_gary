import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ShoppingBag } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { paths } from '@/app/paths'
import { placeQuickOrder } from '@/api/orders'
import { productQueries } from '@/api/products'
import type { Money } from '@/api/types'
import { EmptyState } from '@/components/EmptyState'
import { QueryErrorAlert } from '@/components/QueryErrorAlert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { type CartItem, hasStockIssues } from '@/features/cart/cart-items'
import { useCart, useCartItems } from '@/features/cart/use-cart'
import {
  type CheckoutDetails,
  type CheckoutForm,
  EMPTY_CHECKOUT_FORM,
  parseCheckoutForm,
  selectCustomer,
} from './checkout-form'
import { CustomerSection } from './CustomerSection'
import { OrderSummary } from './OrderSummary'
import { PaymentMethodSection } from './PaymentMethodSection'
import { placeOrders } from './place-orders'
import { PlacementResults } from './PlacementResults'

export function CheckoutPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold tracking-tight">Kasa</h1>
      <CheckoutBody />
    </div>
  )
}

function CheckoutBody() {
  const { items, subtotal, productsQuery } = useCartItems()

  if (productsQuery.isPending) {
    return <Skeleton className="h-96 w-full rounded-xl" />
  }
  if (productsQuery.isError) {
    return (
      <QueryErrorAlert
        title="Nie udało się wczytać koszyka"
        error={productsQuery.error}
        onRetry={() => productsQuery.refetch()}
      />
    )
  }
  if (items.length === 0) {
    return <EmptyCheckout />
  }
  return <CheckoutContent items={items} subtotal={subtotal} />
}

function CheckoutContent({ items, subtotal }: { items: CartItem[]; subtotal: Money }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { removeItem } = useCart()
  const [form, setForm] = useState<CheckoutForm>(EMPTY_CHECKOUT_FORM)
  const [isSubmitted, setSubmitted] = useState(false)

  const placeOrdersMutation = useMutation({
    mutationFn: (details: CheckoutDetails) => placeOrders(items, details, placeQuickOrder),
    onSuccess: (results) => {
      // Stock changed in the database, so cached products are stale.
      void queryClient.invalidateQueries({ queryKey: productQueries.all().queryKey })

      const placed = results.flatMap((result) => (result.status === 'placed' ? [result] : []))
      placed.forEach((result) => removeItem(result.product.productId))
      if (placed.length === results.length) {
        navigate(paths.orderConfirmation(placed.map((result) => result.order.orderId)))
      }
    },
  })

  const parsedForm = parseCheckoutForm(form)
  const errors = isSubmitted && !parsedForm.ok ? parsedForm.errors : {}
  const stockIssues = hasStockIssues(items)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)
    if (parsedForm.ok && !stockIssues) {
      placeOrdersMutation.mutate(parsedForm.details)
    }
  }

  const updateForm = (changes: Partial<CheckoutForm>) => setForm({ ...form, ...changes })

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]"
    >
      <div className="flex flex-col gap-10">
        <CustomerSection
          form={form}
          errors={errors}
          onCustomerChange={(userId) => setForm(selectCustomer(form, userId))}
          onChange={updateForm}
        />
        <PaymentMethodSection
          value={form.paymentMethod}
          onChange={(paymentMethod) => updateForm({ paymentMethod })}
          error={errors.paymentMethod}
        />
      </div>

      <aside className="flex flex-col gap-5 rounded-xl border border-zinc-200 p-5 lg:sticky lg:top-24">
        <OrderSummary items={items} subtotal={subtotal} />
        {stockIssues && (
          <p className="text-sm text-destructive">
            Część produktów nie jest dostępna w wybranej ilości. Popraw koszyk, aby kontynuować.
          </p>
        )}
        <Button type="submit" size="lg" disabled={placeOrdersMutation.isPending || stockIssues}>
          {placeOrdersMutation.isPending && <Spinner />}
          Złóż zamówienie
        </Button>
        {items.length > 1 && (
          <p className="text-xs text-zinc-500">
            Każdy produkt zostanie zrealizowany jako osobne zamówienie.
          </p>
        )}
        {placeOrdersMutation.data && <PlacementResults results={placeOrdersMutation.data} />}
      </aside>
    </form>
  )
}

function EmptyCheckout() {
  return (
    <EmptyState
      icon={ShoppingBag}
      title="Koszyk jest pusty"
      description="Dodaj produkty do koszyka, aby złożyć zamówienie."
      action={
        <Button asChild variant="outline">
          <Link to={paths.catalog}>Przeglądaj katalog</Link>
        </Button>
      }
      className="py-24"
    />
  )
}
