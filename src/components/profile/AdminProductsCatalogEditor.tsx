import React, { useEffect, useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, RefreshCw, X } from 'lucide-react';
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
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ProductCatalogFirestore | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [reindexing, setReindexing] = useState(false);
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
    setFormOpen(false);
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

  const openCreateModal = () => {
    setForm(EMPTY_FORM);
    setEditingProductId(null);
    setImageFile(null);
    setRemoveImage(false);
    setError(null);
    setSuccess(null);
    setFormOpen(true);
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
    setFormOpen(true);
  };

  const parsePayload = (): AdminProductCatalogPayload => {
    const brand = form.brand.trim();
    const nameEs = form.nameEs.trim();
    const nameEn = form.nameEn.trim();
    const descriptionEs = form.descriptionEs.trim();
    const descriptionEn = form.descriptionEn.trim();
    const price = Number(form.price);
    const order = form.order.trim() === '' ? undefined : Number(form.order);
    const tastesLike = form.tastesLike
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    if (!brand || !nameEs || !nameEn || !descriptionEs || !descriptionEn) {
      throw new Error('Completa marca, nombres y descripciones en ambos idiomas.');
    }

    if (!Number.isFinite(price) || price <= 0) {
      throw new Error('Introduce un precio válido mayor que 0.');
    }

    if (order !== undefined && (!Number.isFinite(order) || order < 0)) {
      throw new Error('El orden debe ser un número válido igual o mayor que 0.');
    }

    return {
      brand,
      name: {
        es: nameEs,
        en: nameEn,
      },
      description: {
        es: descriptionEs,
        en: descriptionEn,
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

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeletingId(deleteTarget.id);
    setError(null);
    setSuccess(null);
    try {
      await deleteProductCatalogProduct(deleteTarget.id);
      if (editingProductId === deleteTarget.id) {
        resetForm();
      }
      setSuccess('Producto eliminado correctamente.');
      setDeleteTarget(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el producto.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleReindex = async () => {
    if (reindexing) return;

    const confirmed = window.confirm(
      'Se borrará todo el namespace actual en Pinecone y se reindexarán los productos del catálogo. ¿Deseas continuar?',
    );
    if (!confirmed) return;

    setReindexing(true);
    setError(null);
    setSuccess(null);

    try {
      const { reindexProductsCatalog } = await import('../../services/pineconeService');
      const total = await reindexProductsCatalog();
      setSuccess(total > 0
        ? `Reindexación completada. ${total} productos indexados en Pinecone.`
        : 'Namespace limpiado. No hay productos para indexar.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo reindexar Pinecone.');
    } finally {
      setReindexing(false);
    }
  };

  return (
    <Card variant="outline" className="mt-8 admin-catalog">
      <div className="admin-catalog__header">
        <div>
          <h2 className="heading-display admin-catalog__title">Admin · Catálogo de Productos</h2>
          <p className="admin-catalog__subtitle">Gestiona productos y precios desde una experiencia optimizada para móvil.</p>
        </div>
        <div className="admin-catalog__header-actions">
          <Button variant="secondary" size="sm" loading={reindexing} onClick={handleReindex}>
            {!reindexing && <RefreshCw size={16} />}
            Reindexar
          </Button>
          <Button variant="primary" size="sm" onClick={openCreateModal}>
            <Plus size={16} />
            Nuevo producto
          </Button>
        </div>
      </div>

      {error && <p className="admin-catalog__feedback admin-catalog__feedback--error">{error}</p>}
      {success && <p className="admin-catalog__feedback admin-catalog__feedback--success">{success}</p>}

      <h3 className="heading-display admin-catalog__section-title">Productos actuales</h3>
      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Cargando catálogo...</p>
      ) : products.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No hay productos en el catálogo.</p>
      ) : (
        <div className="grid gap-3">
          {products.map((product) => (
            <Card key={product.id} variant="flat" className="admin-catalog__item !p-4">
              <div className="admin-catalog__item-row">
                <div className="admin-catalog__item-main">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name?.es ?? product.name?.en ?? product.id}
                      className="admin-catalog__thumb"
                    />
                  ) : (
                    <div aria-hidden="true" className="admin-catalog__thumb admin-catalog__thumb--empty" />
                  )}

                  <div className="admin-catalog__item-copy">
                    <p className="admin-catalog__item-title">{product.name?.es || product.name?.en || product.id}</p>
                    <p className="admin-catalog__item-meta">{product.brand}</p>
                    <p className="admin-catalog__item-meta">€{product.price.toFixed(2)} · {product.roast}</p>
                  </div>
                </div>

                <div className="admin-catalog__item-actions">
                  <Button variant="secondary" size="sm" onClick={() => startEdit(product)}>
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    loading={deletingId === product.id}
                    onClick={() => setDeleteTarget(product)}
                  >
                    Borrar
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog.Root
        open={formOpen}
        onOpenChange={(open) => {
          if (saving) return;
          if (!open) resetForm();
          else setFormOpen(true);
        }}
      >
        <AnimatePresence>
          {formOpen && (
            <Dialog.Portal forceMount>
              <Dialog.Overlay asChild>
                <motion.div
                  className="overlay backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              </Dialog.Overlay>

              <Dialog.Content asChild>
                <div className="fixed inset-0 flex items-end sm:items-center justify-center z-modal pointer-events-none">
                  <motion.div
                    className="modal-panel admin-catalog-sheet pointer-events-auto flex flex-col"
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: '100%', opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  >
                    <VisuallyHidden.Root>
                      <Dialog.Title>
                        {editingProductId ? 'Editar producto' : 'Crear producto'}
                      </Dialog.Title>
                      <Dialog.Description>Formulario de administración de catálogo.</Dialog.Description>
                    </VisuallyHidden.Root>

                    <div className="admin-catalog-sheet__header">
                      <h3 className="admin-catalog-sheet__title">
                        {editingProductId ? 'Editar producto' : 'Crear producto'}
                      </h3>
                      <Dialog.Close asChild>
                        <button className="admin-catalog-sheet__close" aria-label="Cerrar">
                          <X size={18} />
                        </button>
                      </Dialog.Close>
                    </div>

                    <div className="admin-catalog-sheet__body">
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
                            className="input-base admin-catalog-sheet__textarea"
                            rows={4}
                            value={form.descriptionEs}
                            onChange={(e) => onInputChange('descriptionEs', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="input-label">Description (EN)</label>
                          <textarea
                            className="input-base admin-catalog-sheet__textarea"
                            rows={4}
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
                          <label className="admin-catalog-sheet__checkbox-row">
                            <input
                              type="checkbox"
                              checked={removeImage}
                              onChange={(e) => setRemoveImage(e.target.checked)}
                            />
                            Borrar imagen actual
                          </label>
                        )}
                        {imagePreviewUrl && (
                          <img src={imagePreviewUrl} alt="preview" className="admin-catalog-sheet__preview" />
                        )}
                      </div>
                    </div>

                    <div className="admin-catalog-sheet__footer">
                      <Button variant="secondary" size="md" fullWidth onClick={resetForm}>
                        Cancelar
                      </Button>
                      <Button variant="primary" size="md" fullWidth loading={saving} onClick={handleSave}>
                        {editingProductId ? 'Guardar cambios' : 'Crear producto'}
                      </Button>
                    </div>
                  </motion.div>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          )}
        </AnimatePresence>
      </Dialog.Root>

      <Dialog.Root open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AnimatePresence>
          {deleteTarget && (
            <Dialog.Portal forceMount>
              <Dialog.Overlay asChild>
                <motion.div
                  className="overlay backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              </Dialog.Overlay>

              <Dialog.Content asChild>
                <div className="fixed inset-0 flex items-end sm:items-center justify-center z-modal pointer-events-none">
                  <motion.div
                    className="modal-panel admin-catalog-confirm pointer-events-auto"
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: '100%', opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  >
                    <VisuallyHidden.Root>
                      <Dialog.Title>Confirmar borrado</Dialog.Title>
                      <Dialog.Description>
                        Confirma si deseas borrar este producto de forma permanente.
                      </Dialog.Description>
                    </VisuallyHidden.Root>

                    <h4 className="admin-catalog-confirm__title">¿Borrar producto?</h4>
                    <p className="admin-catalog-confirm__copy">
                      Se eliminará “{deleteTarget.name?.es || deleteTarget.name?.en || deleteTarget.id}” y no podrás deshacer esta acción.
                    </p>
                    <div className="admin-catalog-confirm__actions">
                      <Button variant="secondary" fullWidth onClick={() => setDeleteTarget(null)}>
                        Cancelar
                      </Button>
                      <Button
                        variant="ghost"
                        fullWidth
                        loading={deletingId === deleteTarget.id}
                        onClick={handleDelete}
                      >
                        Borrar
                      </Button>
                    </div>
                  </motion.div>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          )}
        </AnimatePresence>
      </Dialog.Root>
    </Card>
  );
};
