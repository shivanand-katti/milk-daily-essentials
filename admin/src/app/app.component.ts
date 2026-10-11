import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ProductApiService } from './product-api.service';
import { Product, ProductPayload } from './product.model';

type ProductForm = {
  sku: string;
  name: string;
  description: string;
  unit: string;
  price: number | null;
  imageUrl: string;
  available: boolean;
  stockQuantity: number | null;
};

const emptyForm = (): ProductForm => ({
  sku: '', name: '', description: '', unit: '1 litre', price: null,
  imageUrl: '', available: true, stockQuantity: 0
});

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="shell">
      <aside class="sidebar">
        <div class="brand"><span class="brand-mark">fm</span><span>fresh milk<small>DAILY ESSENTIALS</small></span></div>
        <div class="nav-label">WORKSPACE</div>
        <div class="nav-item active"><span>▦</span> Products <span class="nav-count">{{ products.length }}</span></div>
        <div class="sidebar-note"><span class="status-dot"></span> Catalog management</div>
        <div class="sidebar-footer">Milk & Daily Essentials<br><small>Admin workspace</small></div>
      </aside>

      <main class="main">
        <header class="topbar">
          <div><div class="eyebrow">INVENTORY / CATALOG</div><h1>Products</h1></div>
          <div class="top-actions">
            <span class="live-chip"><span class="status-dot"></span> API connected when loaded</span>
            <button class="button primary" (click)="startCreate()">＋ Add product</button>
          </div>
        </header>

        <section class="welcome">
          <div><div class="welcome-kicker">YOUR STORE, AT A GLANCE</div><h2>Keep your essentials moving.</h2>
            <p>Manage product details, pricing, stock and availability from one place.</p></div>
          <div class="welcome-art" aria-hidden="true"><span>✳</span><div class="bottle"></div><div class="cart">▱</div></div>
        </section>

        <section class="connection card">
          <div class="section-heading"><div><h3>API access</h3><p>Enter the admin API key configured in Render. It stays in this page's memory only.</p></div>
            <span class="secure-label">🔒 Key not saved</span></div>
          <form class="key-form" (ngSubmit)="connect()">
            <input aria-label="Admin API key" type="password" name="apiKey" [(ngModel)]="apiKey" placeholder="Paste ADMIN_API_KEY from Render" autocomplete="off" required>
            <button class="button dark" type="submit" [disabled]="loading || !apiKey.trim()">{{ loading ? 'Connecting…' : 'Connect & load products' }}</button>
          </form>
        </section>

        <div *ngIf="message" class="notice" [class.error]="isError">{{ message }}</div>

        <section class="stats">
          <div class="stat card"><div class="stat-label">TOTAL PRODUCTS</div><div class="stat-value">{{ products.length }}</div><div class="stat-foot">In your catalog</div></div>
          <div class="stat card"><div class="stat-label">AVAILABLE</div><div class="stat-value">{{ availableCount }}</div><div class="stat-foot">Visible to customers</div></div>
          <div class="stat card"><div class="stat-label">LOW STOCK</div><div class="stat-value">{{ lowStockCount }}</div><div class="stat-foot">10 units or fewer</div></div>
          <div class="stat card"><div class="stat-label">CATALOG VALUE</div><div class="stat-value">{{ catalogValue | currency:'INR':'symbol':'1.0-0' }}</div><div class="stat-foot">Price × stock on hand</div></div>
        </section>

        <section class="catalog card">
          <div class="catalog-heading"><div><h3>Product catalog</h3><p>Search and update the items customers can order.</p></div>
            <div class="catalog-tools"><input aria-label="Search products" class="search" [(ngModel)]="searchTerm" name="searchTerm" placeholder="⌕  Search name or SKU"><button class="button outline" (click)="loadProducts()" [disabled]="loading || !apiKey.trim()">↻ Refresh</button></div></div>
          <div class="table-wrap">
            <table>
              <thead><tr><th>PRODUCT</th><th>SKU</th><th>PRICE</th><th>STOCK</th><th>STATUS</th><th class="right">ACTIONS</th></tr></thead>
              <tbody>
                <tr *ngFor="let product of filteredProducts">
                  <td><div class="product-cell"><div class="product-thumb">{{ initials(product.name) }}</div><div><strong>{{ product.name }}</strong><small>{{ product.unit }}</small></div></div></td>
                  <td><span class="sku">{{ product.sku }}</span></td>
                  <td><strong>{{ product.price | currency:'INR':'symbol':'1.2-2' }}</strong></td>
                  <td><span [class.low-stock]="product.stockQuantity !== null && product.stockQuantity <= 10">{{ product.stockQuantity ?? '—' }}</span></td>
                  <td><span class="badge" [class.enabled]="product.available" [class.disabled-badge]="!product.available"><span></span>{{ product.available ? 'Available' : 'Hidden' }}</span></td>
                  <td class="right actions"><button class="icon-button" (click)="startEdit(product)" [attr.aria-label]="'Edit ' + product.name" title="Edit">✎</button><button class="icon-button danger" (click)="remove(product)" [attr.aria-label]="'Delete ' + product.name" title="Delete">⌫</button></td>
                </tr>
                <tr *ngIf="filteredProducts.length === 0"><td colspan="6" class="empty"><div class="empty-icon">▦</div><strong>{{ products.length ? 'No matching products' : 'Your catalog is waiting' }}</strong><p>{{ products.length ? 'Try another search term.' : 'Connect with your admin key to load the catalog.' }}</p></td></tr>
              </tbody>
            </table>
          </div>
          <div class="table-footer"><span>Showing {{ filteredProducts.length }} of {{ products.length }} products</span><span>Prices shown in INR · Sample prices should be reviewed</span></div>
        </section>
        <footer>Fresh Milk Admin <span>·</span> Product data is managed by your Spring Boot API.</footer>
      </main>
    </div>

    <div class="modal-backdrop" *ngIf="editorOpen" (click)="closeEditor()">
      <section class="modal card" role="dialog" aria-modal="true" aria-labelledby="editor-title" (click)="$event.stopPropagation()">
        <div class="modal-heading"><div><div class="eyebrow">{{ editing ? 'CATALOG / EDIT' : 'CATALOG / NEW ITEM' }}</div><h2 id="editor-title">{{ editing ? 'Edit product' : 'Add a product' }}</h2></div><button class="icon-button" type="button" (click)="closeEditor()">×</button></div>
        <form #productForm="ngForm" (ngSubmit)="save(productForm)">
          <div class="form-grid">
            <label>Product name<input name="name" [(ngModel)]="form.name" required maxlength="180" placeholder="e.g. Fresh Cow Milk"></label>
            <label>SKU<input name="sku" [(ngModel)]="form.sku" required maxlength="64" placeholder="e.g. MILK-COW-1L"></label>
            <label>Unit / pack size<input name="unit" [(ngModel)]="form.unit" required maxlength="40" placeholder="e.g. 1 litre"></label>
            <label>Price (₹)<input name="price" [(ngModel)]="form.price" required type="number" min="0" step="0.01"></label>
            <label>Stock quantity<input name="stockQuantity" [(ngModel)]="form.stockQuantity" type="number" min="0" step="1"></label>
            <label>Image URL <span class="optional">optional</span><input name="imageUrl" [(ngModel)]="form.imageUrl" maxlength="1000" type="url" placeholder="https://…"></label>
            <label class="full">Description<textarea name="description" [(ngModel)]="form.description" rows="3" maxlength="10000" placeholder="Short description customers will see"></textarea></label>
            <label class="availability full"><input name="available" [(ngModel)]="form.available" type="checkbox"><span><strong>Available to customers</strong><small>Turn off to hide the product from the customer catalog.</small></span></label>
          </div>
          <div *ngIf="editorError" class="notice error">{{ editorError }}</div>
          <div class="modal-actions"><button type="button" class="button outline" (click)="closeEditor()">Cancel</button><button class="button primary" type="submit" [disabled]="saving || productForm.invalid">{{ saving ? 'Saving…' : (editing ? 'Save changes' : 'Create product') }}</button></div>
        </form>
      </section>
    </div>
  `
})
export class AppComponent {
  private readonly api = inject(ProductApiService);
  apiKey = '';
  products: Product[] = [];
  loading = false;
  saving = false;
  message = '';
  isError = false;
  searchTerm = '';
  editorOpen = false;
  editing: Product | null = null;
  editorError = '';
  form: ProductForm = emptyForm();

  get filteredProducts(): Product[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.products;
    return this.products.filter(p => p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term));
  }
  get availableCount(): number { return this.products.filter(p => p.available).length; }
  get lowStockCount(): number { return this.products.filter(p => p.stockQuantity !== null && p.stockQuantity <= 10).length; }
  get catalogValue(): number { return this.products.reduce((sum, p) => sum + p.price * (p.stockQuantity ?? 0), 0); }

  connect(): void { if (this.apiKey.trim()) this.loadProducts(); }
  loadProducts(): void {
    this.loading = true; this.message = ''; this.isError = false;
    this.api.list(this.apiKey.trim()).subscribe({
      next: products => { this.products = products; this.loading = false; this.message = 'Catalog loaded successfully.'; },
      error: error => { this.loading = false; this.reportError(error, 'Could not load products.'); }
    });
  }
  startCreate(): void { this.editing = null; this.form = emptyForm(); this.editorError = ''; this.editorOpen = true; }
  startEdit(product: Product): void {
    this.editing = product; this.editorError = '';
    this.form = { sku: product.sku, name: product.name, description: product.description ?? '', unit: product.unit,
      price: product.price, imageUrl: product.imageUrl ?? '', available: product.available, stockQuantity: product.stockQuantity };
    this.editorOpen = true;
  }
  closeEditor(): void { if (!this.saving) this.editorOpen = false; }
  save(form: NgForm): void {
    if (form.invalid || this.form.price === null || this.form.price < 0 || this.saving) return;
    if (this.form.stockQuantity !== null && (!Number.isInteger(Number(this.form.stockQuantity)) || Number(this.form.stockQuantity) < 0)) {
      this.editorError = 'Stock must be a whole number zero or greater.'; return;
    }
    const payload: ProductPayload = { sku: this.form.sku.trim(), name: this.form.name.trim(), description: this.form.description.trim(),
      unit: this.form.unit.trim(), price: Number(this.form.price), imageUrl: this.form.imageUrl.trim(), available: this.form.available,
      stockQuantity: this.form.stockQuantity === null ? null : Number(this.form.stockQuantity) };
    this.saving = true; this.editorError = '';
    const request = this.editing ? this.api.update(this.apiKey.trim(), this.editing.id, payload) : this.api.create(this.apiKey.trim(), payload);
    request.subscribe({
      next: () => { this.saving = false; this.editorOpen = false; this.message = this.editing ? 'Product updated.' : 'Product created.'; this.isError = false; this.loadProducts(); },
      error: error => { this.saving = false; this.editorError = this.errorMessage(error, 'Could not save product.'); }
    });
  }
  remove(product: Product): void {
    if (!this.apiKey.trim() || !window.confirm('Delete "' + product.name + '"? This removes it from the catalog.')) return;
    this.message = ''; this.api.delete(this.apiKey.trim(), product.id).subscribe({
      next: () => { this.products = this.products.filter(p => p.id !== product.id); this.message = 'Product deleted.'; this.isError = false; },
      error: error => this.reportError(error, 'Could not delete product.')
    });
  }
  initials(name: string): string { return name.split(/\s+/).filter(Boolean).slice(0, 2).map(word => word[0].toUpperCase()).join(''); }
  private reportError(error: unknown, fallback: string): void { this.isError = true; this.message = this.errorMessage(error, fallback); }
  private errorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) return 'Cannot reach the API. Check the Render service and CORS configuration.';
      if (error.status === 401) return 'Admin key rejected. Check ADMIN_API_KEY in Render and try again.';
      if (error.status === 400) return 'Some product details are invalid. Check SKU, name, unit, price and stock.';
      if (error.status === 409) return 'That SKU may already exist. Choose a unique SKU.';
      if (error.status === 404) return 'The product no longer exists. Refresh the catalog.';
    }
    return fallback;
  }
}
