import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getProducts } from '@/lib/actions/products'
import { ProductTable } from '@/components/products/product-table'
import { ProductForm } from '@/components/products/product-form'

export default async function ProductsPage() {
  const products = await getProducts()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">제품 관리</h1>
          <p className="text-muted-foreground">음료 제품 카탈로그를 관리합니다</p>
        </div>
        <ProductForm />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>제품 목록 ({products.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductTable products={products} />
        </CardContent>
      </Card>
    </div>
  )
}
