import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import {
  onProductsCatalog,
  createProductCatalogProduct,
  updateProductCatalogProduct,
  deleteProductCatalogProduct,
  type ProductCatalogFirestore,
  type AdminProductCatalogPayload,
} from '../../providers/firebaseProvider';

interface ProductFormState {
  brand: string;
  nameEs: string;
  nameEn: string;
  descriptionEs: string;
  descriptionEn: string;
  price: string;
  roast: 'light' | 'medium' | 'dark';
  tastesLike: string;
  order: string;
  isNew: boolean;
}

const EMPTY_FORM: ProductFormState = {
  brand: '',
  nameEs: '',
  nameEn: '',
  descriptionEs: '',
  descriptionEn: '',
  price: '',
  roast: 'medium',
  tastesLike: '',
  order: '',
  isNew: false,
};

export const AdminProductsCatalogEditor: React.FC = () => {
  const [products, setProducts] = useState<ProductCatalogFirestore[]>([]);
  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onProductsCatalog((items) => {
      setProducts(items);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const imagePreviewUrl = useMemo(() => {
    if (!imageFile) return null;
    return URL.createObjectURL(imageFile);
  }, [imageFile]);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    };
  }, [imagePreviewUrl]);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingProductId(null);
    setImageFile(null);
    setRemoveImage(false);
    setError(null);
  };

  const onInputChange = (key: keyof ProductFormState, value: string | boolean) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const startEdit = (product: ProductCatalogFirestore) => {
    setEditingProductId(product.id);
    setForm({
      brand: product.brand,
      nameEs: product.name?.es ?? '',
      nameEn: product.name?.en ?? '',
      descriptionEs: product.description?.es ?? '',
      descriptionEn: product.description?.en ?? '',
      price: String(product.price ?? ''),
      roast: product.roast,
      tastesLike: (product.tastesLike ?? []).join(', '),
      order: product.order != null ? String(product.order) : '',
      isNew: Boolean(product.isNew),
    });
    setImageFile(null);
    setRemoveImage(false);
    setError(null);
    setSuccess(null);
  };

  const parsePayload = (): AdminProductCatalogPayload => {
    const price = Number(form.price);
    const order = form.order.trim() === '' ? undefined : Number(form.order);
    const tastesLike = form.tastesLike
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    return {
      brand: form.brand,
      name: {
        es: form.nameEs,
        en: form.nameEn,
      },
      description: {
        es: form.descriptionEs,
        en: form.descriptionEn,
      },
      price,
      roast: form.roast,
      tastesLike,
      order,
      isNew: form.isNew,
    };
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = parsePayload();
      if (!editingProductId) {
        if (!imageFile) {
          throw new Error('La imagen es obligatoria al crear un producto.');
        }
        await createProductCatalogProduct(payload, imageFile);
        setSuccess('Producto creado correctamente.');
      } else {
        await updateProductCatalogProduct(editingProductId, payload, imageFile, { removeImage });
        setSuccess('Producto actualizado correctamente.');
      }
      resetForm();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el producto.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId: string) => {
    const confirmed = window.confirm('¿Seguro que quieres borrar este producto? Esta acción no se puede deshacer.');
    if (!confirmed) return;

    setDeletingId(productId);
    setError(null);
    setSuccess(null);
    try {
      await deleteProductCatalogProduct(productId);
      if (editingProductId === productId) {
        resetForm();
      }
      setSuccess('Producto eliminado correctamente.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el producto.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card variant="outline" className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="heading-display" style={{ fontSize: 'var(--text-2xl)' }}>
          Admin · Catálogo de Productos
        </h2>
        {editingProductId && (
          <Button variant="ghost" size="sm" onClick={resetForm}>
            Cancelar edición
          </Button>
        )}
      </div>

      {error && (
        <p style={{ color: 'var(--color-error)', marginBottom: 'var(--space-3)' }}>{error}</p>
      )}
      {success && (
        <p style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-3)' }}>{success}</p>
      )}

      <div className="grid md:grid-cols-2 gap-3">
        <Input label="Marca" value={form.brand} onChange={(e) => onInputChange('brand', e.target.value)} />
        <Input label="Precio (€)" type="number" step="0.01" value={form.price} onChange={(e) => onInputChange('price', e.target.value)} />
        <Input label="Nombre (ES)" value={form.nameEs} onChange={(e) => onInputChange('nameEs', e.target.value)} />
        <Input label="Name (EN)" value={form.nameEn} onChange={(e) => onInputChange('nameEn', e.target.value)} />
      </div>

      <div className="grid md:grid-cols-2 gap-3 mt-3">
        <div>
          <label className="input-label">Descripción (ES)</label>
          <textarea
            className="input-base"
            rows={3}
            value={form.descriptionEs}
            onChange={(e) => onInputChange('descriptionEs', e.target.value)}
          />
        </div>
        <div>
          <label className="input-label">Description (EN)</label>
          <textarea
            className="input-base"
            rows={3}
            value={form.descriptionEn}
            onChange={(e) => onInputChange('descriptionEn', e.target.value)}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-3 mt-3">
        <div>
          <label className="input-label">Tueste</label>
          <select
            className="input-base"
            value={form.roast}
            onChange={(e) => onInputChange('roast', e.target.value as ProductFormState['roast'])}
          >
            <option value="light">Light</option>
            <option value="medium">Medium</option>
            <option value="dark">Dark</option>
          </select>
        </div>
        <Input
          label="Notas de sabor (coma separadas)"
          value={form.tastesLike}
          onChange={(e) => onInputChange('tastesLike', e.target.value)}
        />
        <Input label="Order" type="number" value={form.order} onChange={(e) => onInputChange('order', e.target.value)} />
      </div>

      <div className="mt-3">
        <label className="input-label">Imagen</label>
        <input
          className="input-base"
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
        />
        {editingProductId && (
          <label className="flex items-center gap-2 mt-2" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
            <input
              type="checkbox"
              checked={removeImage}
              onChange={(e) => setRemoveImage(e.target.checked)}
            />
            Borrar imagen actual
          </label>
        )}
        {imagePreviewUrl && (
          <img
            src={imagePreviewUrl}
            alt="preview"
            style={{ marginTop: 'var(--space-2)', width: 96, height: 96, objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
          />
        )}
      </div>

      <div className="mt-4">
        <Button variant="primary" loading={saving} onClick={handleSave}>
          {editingProductId ? 'Guardar cambios' : 'Crear producto'}
        </Button>
      </div>

      <hr style={{ margin: 'var(--space-6) 0', borderColor: 'var(--border-subtle)' }} />

      <h3 className="heading-display" style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-3)' }}>
        Productos actuales
      </h3>
      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Cargando catálogo...</p>
      ) : products.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No hay productos en el catálogo.</p>
      ) : (
        <div className="grid gap-3">
          {products.map((product) => (
            <Card key={product.id} variant="flat" className="!p-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex items-center gap-3">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name?.es ?? product.name?.en ?? product.id}
                      style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
                    />
                  ) : (
                    <div
                      aria-hidden="true"
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    />
                  )}
                  <div>
                    <p style={{ fontWeight: 600 }}>{product.name?.es || product.name?.en || product.id}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                      {product.brand} · €{product.price.toFixed(2)} · {product.roast}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => startEdit(product)}>
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    loading={deletingId === product.id}
                    onClick={() => handleDelete(product.id)}
                  >
                    Borrar
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Card>
  );
};
