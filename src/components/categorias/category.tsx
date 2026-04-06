import { Button, Label, Modal, Select, Spinner, Table, TextInput } from "flowbite-react";
import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";

import { getUsers, User } from "../../services/UserService";

type Category = {
  id: number;
  name: string;
  shortDescription?: string;
  price?: number;
  isCustom?: boolean;
  emoji?: string;
  isActive?: boolean;
  isVendorActive?: boolean;
};

const CATEGORY_EMOJIS = [
  "🛍️",
  "🍔",
  "📚",
  "🎮",
  "💄",
  "🏡",
  "⚽",
  "🐶",
  "💻",
  "🎵",
  "👕",
  "👟",
  "⌚",
  "🕶️",
  "🧢",
  "🧸",
  "🍼",
  "🧴",
  "🧼",
  "🪑",
  "🛏️",
  "🍎",
  "🥗",
  "🍕",
  "☕",
  "🧃",
  "🍰",
  "💊",
  "🩺",
  "🧠",
  "🌿",
  "🚗",
  "🏍️",
  "🚲",
  "✈️",
  "🏨",
  "🎬",
  "📷",
  "🎨",
  "🧩",
  "🎧",
  "📱",
  "🖥️",
  "🕹️",
  "🔌",
  "🔋",
  "🐱",
  "🐠",
  "🌸",
  "🌱",
  "🧰",
  "🔧",
  "🪴",
  "🕯️",
  "🎁",
  "💼",
  "📦",
  "🗂️",
];

const CATEGORY_KEYWORD_EMOJI_PAIRS: Array<[string, string]> = [
  ["artesania", "🎨"],
  ["artesanía", "🎨"],
  ["automovil", "🚗"],
  ["automóvil", "🚗"],
  ["cocina", "🍳"],
  ["panaderia", "🥖"],
  ["panadería", "🥖"],
  ["zapateria", "👞"],
  ["zapatería", "👞"],
  ["floristeria", "💐"],
  ["floristería", "💐"],
  ["lenceria", "🩱"],
  ["lencería", "🩱"],
  ["instrumento", "🎸"],
  ["instrumentos", "🎸"],
  ["ropa", "👕"],
  ["moda", "👗"],
  ["fashion", "👗"],
  ["zapatos", "👟"],
  ["sneaker", "👟"],
  ["reloj", "⌚"],
  ["accesorio", "👜"],
  ["joya", "💍"],
  ["juguete", "🧸"],
  ["bebe", "🍼"],
  ["bebé", "🍼"],
  ["higiene", "🧼"],
  ["limpieza", "🧴"],
  ["mueble", "🪑"],
  ["cama", "🛏️"],
  ["decoracion", "🕯️"],
  ["decoración", "🕯️"],
  ["comida", "🍔"],
  ["food", "🍔"],
  ["restaurante", "🍽️"],
  ["cafe", "☕"],
  ["café", "☕"],
  ["postre", "🍰"],
  ["salud", "💊"],
  ["farmacia", "💊"],
  ["medico", "🩺"],
  ["médico", "🩺"],
  ["tecnologia", "💻"],
  ["tecnología", "💻"],
  ["tech", "💻"],
  ["celular", "📱"],
  ["movil", "📱"],
  ["móvil", "📱"],
  ["gaming", "🎮"],
  ["juegos", "🎮"],
  ["hogar", "🏡"],
  ["casa", "🏡"],
  ["deportes", "⚽"],
  ["gym", "🏋️"],
  ["belleza", "💄"],
  ["maquillaje", "💄"],
  ["makeup", "💄"],
  ["mascotas", "🐶"],
  ["pets", "🐶"],
  ["gato", "🐱"],
  ["musica", "🎵"],
  ["música", "🎵"],
  ["music", "🎵"],
  ["libros", "📚"],
  ["books", "📚"],
  ["oficina", "💼"],
  ["papeleria", "✏️"],
  ["papelería", "✏️"],
  ["viaje", "✈️"],
  ["turismo", "🧳"],
  ["auto", "🚗"],
  ["moto", "🏍️"],
  ["foto", "📷"],
  ["arte", "🎨"],
  ["plantas", "🪴"],
  ["jardin", "🌱"],
  ["jardín", "🌱"],
  ["ferreteria", "🧰"],
  ["ferretería", "🧰"],
];

const EMOJI_CHOICES = Array.from(new Set([...CATEGORY_EMOJIS, ...CATEGORY_KEYWORD_EMOJI_PAIRS.map(([, emoji]) => emoji)]));

const normalizeCategoryName = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

const extractLeadingEmoji = (value: string) => {
  const match = value.trim().match(/^(\p{Emoji_Presentation}|\p{Extended_Pictographic})/u);
  return match?.[0];
};

const getCategoryEmoji = (categoryName: string, id: number) => {
  const leadingEmoji = extractLeadingEmoji(categoryName);
  if (leadingEmoji) return leadingEmoji;

  const normalized = normalizeCategoryName(categoryName);

  for (const [keyword, emoji] of CATEGORY_KEYWORD_EMOJI_PAIRS) {
    if (normalized.includes(normalizeCategoryName(keyword))) {
      return emoji;
    }
  }

  const nameHash = normalized
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  return CATEGORY_EMOJIS[(nameHash + id) % CATEGORY_EMOJIS.length];
};

const CategoryTable = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);

  const [customCategories, setCustomCategories] = useState<Category[]>([]);
  const [editedBaseCategories, setEditedBaseCategories] = useState<
    Record<number, Pick<Category, "name" | "emoji" | "price" | "shortDescription" | "isActive" | "isVendorActive">>
  >({});
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createCategoryName, setCreateCategoryName] = useState("");
  const [createCategoryPrice, setCreateCategoryPrice] = useState("0");
  const [createCategoryShortDescription, setCreateCategoryShortDescription] = useState("");
  const [createCategoryEmoji, setCreateCategoryEmoji] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editCategoryPrice, setEditCategoryPrice] = useState("0");
  const [editCategoryShortDescription, setEditCategoryShortDescription] = useState("");
  const [editCategoryEmoji, setEditCategoryEmoji] = useState("");
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null);
  const [viewCategoryPrice, setViewCategoryPrice] = useState("0");
  const [viewCategoryShortDescription, setViewCategoryShortDescription] = useState("");
  const [viewCategoryIsActive, setViewCategoryIsActive] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    let isMounted = true;

    const loadUsers = async () => {
      if (isMounted) {
        setUsersLoading(true);
      }

      try {
        const data = await getUsers();

        if (isMounted) {
          setUsers(data);
          setUsersError(null);
        }
      } catch {
        if (isMounted) {
          setUsersError("No se pudieron cargar las categorías.");
        }
      } finally {
        if (isMounted) {
          setUsersLoading(false);
        }
      }
    };

    loadUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  const baseCategories = useMemo<Category[]>(
    () =>
      users.map((user) => ({
        id: user.id,
        name: editedBaseCategories[user.id]?.name ?? user.name,
        emoji: editedBaseCategories[user.id]?.emoji,
        price: editedBaseCategories[user.id]?.price ?? 0,
        shortDescription: editedBaseCategories[user.id]?.shortDescription ?? `Producto ${user.name}`,
        isActive: editedBaseCategories[user.id]?.isActive ?? true,
        isVendorActive: editedBaseCategories[user.id]?.isVendorActive ?? true,
        isCustom: false,
      })),
    [users, editedBaseCategories],
  );

  const categories = useMemo(
    () => [...baseCategories, ...customCategories].sort((a, b) => a.id - b.id),
    [baseCategories, customCategories],
  );

  const nextCategoryId = useMemo(() => {
    if (categories.length === 0) return 1;
    return Math.max(...categories.map((c) => c.id)) + 1;
  }, [categories]);

  const activeCategories = useMemo(
    () => categories.filter((category) => category.isActive !== false && category.isVendorActive !== false),
    [categories],
  );

  const totalPages = Math.max(1, Math.ceil(activeCategories.length / pageSize));
  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return activeCategories.slice(start, start + pageSize);
  }, [activeCategories, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleAddCategory = async () => {
    const cleanName = createCategoryName.trim();
    const cleanEmoji = createCategoryEmoji.trim();
    const cleanShortDescription = createCategoryShortDescription.trim();
    const parsedPrice = Number(createCategoryPrice);
    if (!cleanName || isAddingCategory) return;
    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      alert("El precio debe ser un número válido.");
      return;
    }

    const exists = activeCategories.some((category) => category.name.toLowerCase() === cleanName.toLowerCase());
    if (exists) {
      alert("Esa categoría ya existe.");
      return;
    }

    const newCategory: Category = {
      id: nextCategoryId,
      name: cleanName,
      isCustom: true,
      emoji: cleanEmoji || getCategoryEmoji(cleanName, nextCategoryId),
      price: parsedPrice,
      shortDescription: cleanShortDescription || `Producto ${cleanName}`,
      isActive: true,
      isVendorActive: true,
    };

    setIsAddingCategory(true);

    await new Promise((resolve) => setTimeout(resolve, 450));

    setCustomCategories((prev) => [...prev, newCategory]);
    setCreateCategoryName("");
    setCreateCategoryPrice("0");
    setCreateCategoryShortDescription("");
    setCreateCategoryEmoji("");
    setIsCreateModalOpen(false);
    setIsAddingCategory(false);
  };

  const handleCategoryAction = (action: string, category: Category) => {
    switch (action) {
      case "edit":
        setEditingCategory(category);
        setEditCategoryName(category.name);
        setEditCategoryPrice(String(category.price ?? 0));
        setEditCategoryShortDescription(category.shortDescription ?? "");
        setEditCategoryEmoji(category.emoji ?? getCategoryEmoji(category.name, category.id));
        break;
      case "delete":
        if (!category.isCustom) {
          alert("Solo puedes eliminar categorías creadas por ti.");
          return;
        }

        if (confirm(`¿Eliminar categoría "${category.name}"?`)) {
          setCustomCategories((prev) => prev.filter((c) => c.id !== category.id));
        }
        break;
      case "view":
        setViewingCategory(category);
        setViewCategoryPrice(String(category.price ?? 0));
        setViewCategoryShortDescription(category.shortDescription ?? "");
        setViewCategoryIsActive(category.isActive !== false);
        break;
    }
  };

  const handleSaveCategoryDetails = () => {
    if (!viewingCategory) return;

    const parsedPrice = Number(viewCategoryPrice);
    const cleanShortDescription = viewCategoryShortDescription.trim();

    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      alert("El precio debe ser un número válido.");
      return;
    }

    if (viewingCategory.isCustom) {
      setCustomCategories((prev) =>
        prev.map((category) =>
          category.id === viewingCategory.id
            ? {
                ...category,
                price: parsedPrice,
                shortDescription: cleanShortDescription,
                isActive: viewCategoryIsActive,
              }
            : category,
        ),
      );
    } else {
      setEditedBaseCategories((prev) => ({
        ...prev,
        [viewingCategory.id]: {
          name: prev[viewingCategory.id]?.name ?? viewingCategory.name,
          emoji: prev[viewingCategory.id]?.emoji ?? viewingCategory.emoji,
          isActive: viewCategoryIsActive,
          isVendorActive: prev[viewingCategory.id]?.isVendorActive ?? true,
          price: parsedPrice,
          shortDescription: cleanShortDescription,
        },
      }));
    }

    setViewingCategory(null);
    setViewCategoryPrice("0");
    setViewCategoryShortDescription("");
    setViewCategoryIsActive(true);
  };

  const handleCloseViewModal = () => {
    setViewingCategory(null);
    setViewCategoryPrice("0");
    setViewCategoryShortDescription("");
    setViewCategoryIsActive(true);
  };

  const handleSaveCategoryEdit = () => {
    if (!editingCategory) return;

    const cleanName = editCategoryName.trim();
    const cleanEmoji = editCategoryEmoji.trim();
    const cleanShortDescription = editCategoryShortDescription.trim();
    const parsedPrice = Number(editCategoryPrice);

    if (!cleanName) {
      alert("El nombre de la categoría no puede estar vacío.");
      return;
    }
    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      alert("El precio debe ser un número válido.");
      return;
    }

    const exists = activeCategories.some(
      (category) =>
        category.id !== editingCategory.id && category.name.toLowerCase() === cleanName.toLowerCase(),
    );
    if (exists) {
      alert("Ya existe otra categoría con ese nombre.");
      return;
    }

    const nextEmoji = cleanEmoji || getCategoryEmoji(cleanName, editingCategory.id);

    if (editingCategory.isCustom) {
      setCustomCategories((prev) =>
        prev.map((category) =>
          category.id === editingCategory.id
            ? {
                ...category,
                name: cleanName,
                emoji: nextEmoji,
                price: parsedPrice,
                shortDescription: cleanShortDescription,
              }
            : category,
        ),
      );
    } else {
      setEditedBaseCategories((prev) => ({
        ...prev,
        [editingCategory.id]: {
          name: cleanName,
          emoji: nextEmoji,
          price: parsedPrice,
          shortDescription: cleanShortDescription,
          isActive: true,
          isVendorActive: true,
        },
      }));
    }

    setEditingCategory(null);
    setEditCategoryName("");
    setEditCategoryPrice("0");
    setEditCategoryShortDescription("");
    setEditCategoryEmoji("");
  };

  const handleCloseEditModal = () => {
    setEditingCategory(null);
    setEditCategoryName("");
    setEditCategoryPrice("0");
    setEditCategoryShortDescription("");
    setEditCategoryEmoji("");
  };

  const showLoading = usersLoading || isAddingCategory;

  return (
    <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-4 relative w-full break-words mt-4">
      <div className="flex flex-wrap items-center gap-4">
        <h5 className="card-title mb-0">Categorías</h5>
        <Button
          color="success"
          className="min-w-[220px]"
          onClick={() => setIsCreateModalOpen(true)}
          disabled={usersLoading}
        >
          <Icon icon="mdi:plus" className="mr-2 h-4 w-4" />
          Agregar categoría
        </Button>
      </div>

      <div className="mt-2">
        {showLoading ? (
          <div className="flex h-[220px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-gray-300 bg-gray-50/70 text-sm text-dark">
            <Icon icon="mdi:loading" className="h-10 w-10 animate-spin text-primary" />
            <Spinner size="lg" />
            <span className="font-medium">
              {usersLoading ? "Cargando categorías..." : "Actualizando categorías..."}
            </span>
          </div>
        ) : usersError ? (
          <div className="text-sm text-error">{usersError}</div>
        ) : (
          <div className="overflow-x-auto">
            <Table hoverable className="text-center">
              <Table.Head>
                <Table.HeadCell className="p-3 text-center">ID</Table.HeadCell>
                <Table.HeadCell className="py-3 text-center">Categoría</Table.HeadCell>
                <Table.HeadCell className="py-3 text-center">Precio</Table.HeadCell>
                <Table.HeadCell className="py-3 text-center">Descripción corta</Table.HeadCell>
                <Table.HeadCell className="py-3 text-center">Estado</Table.HeadCell>
                <Table.HeadCell className="py-3 text-center">Acciones</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y divide-border dark:divide-darkborder">
                {paginatedCategories.map((category) => (
                  <Table.Row key={category.id}>
                    <Table.Cell className="whitespace-nowrap px-3 py-3 text-center align-middle">{category.id}</Table.Cell>
                    <Table.Cell className="py-3 text-center align-middle">
                      <span className="inline-flex items-center justify-center gap-2">
                        <span role="img" aria-label={`emoji de ${category.name}`}>
                          {category.emoji ?? getCategoryEmoji(category.name, category.id)}
                        </span>
                        {category.name}
                      </span>
                    </Table.Cell>
                    <Table.Cell className="py-3 text-center align-middle">
                      ${Number(category.price ?? 0).toFixed(2)}
                    </Table.Cell>
                    <Table.Cell className="py-3 text-center align-middle">
                      {category.shortDescription ?? "-"}
                    </Table.Cell>
                    <Table.Cell className="py-3 text-center align-middle">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          category.isActive !== false
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {category.isActive !== false ? "Activo" : "Inactivo"}
                      </span>
                    </Table.Cell>
                    <Table.Cell className="py-3 align-middle">
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          className="border border-gray-400 text-gray-600 bg-white hover:bg-gray-100"
                          size="xs"
                          onClick={() => handleCategoryAction("view", category)}
                        >
                          <Icon icon="mdi:eye-outline" className="mr-1 h-4 w-4" />
                          Ver detalles
                        </Button>

                        <Button
                          className="border border-red-500 text-red-600 bg-white hover:bg-red-50"
                          size="xs"
                          onClick={() => handleCategoryAction("delete", category)}
                        >
                          <Icon icon="mdi:close-circle-outline" className="mr-1 h-4 w-4" />
                          Eliminar
                        </Button>
                        <Button
                          className="border border-green-500 text-green-600 bg-white hover:bg-green-50"
                          size="xs"
                          onClick={() => handleCategoryAction("edit", category)}
                        >
                          <Icon icon="mdi:pencil-outline" className="mr-1 h-4 w-4" />
                          Actualizar
                        </Button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
            <div className="mt-3 flex items-center justify-center gap-3">
              <Button size="xs" color="gray" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
                Anterior
              </Button>
              <span className="text-sm">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                size="xs"
                color="gray"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </div>

      <Modal show={Boolean(editingCategory)} onClose={handleCloseEditModal}>
        <Modal.Header>Actualizar categoría</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-category-name" value="Nombre de categoría" />
              <TextInput
                id="edit-category-name"
                value={editCategoryName}
                onChange={(e) => setEditCategoryName(e.target.value)}
                placeholder="Ej: tecnología"
              />
            </div>
            <div>
              <Label htmlFor="edit-category-emoji" value="Emoji" />
              <div
                id="edit-category-emoji"
                className="mt-2 max-h-40 overflow-y-auto rounded-lg border border-gray-200 p-2"
              >
                <div className="grid grid-cols-8 gap-2">
                  {EMOJI_CHOICES.map((emoji) => {
                    const isSelected = editCategoryEmoji === emoji;
                    return (
                      <button
                        key={emoji}
                        type="button"
                        className={`rounded-md border p-2 text-lg transition ${
                          isSelected
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 bg-white hover:bg-gray-50"
                        }`}
                        onClick={() => setEditCategoryEmoji(emoji)}
                        aria-label={`Seleccionar emoji ${emoji}`}
                      >
                        {emoji}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-category-price" value="Precio" />
              <TextInput
                id="edit-category-price"
                type="number"
                min="0"
                step="0.01"
                value={editCategoryPrice}
                onChange={(e) => setEditCategoryPrice(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-category-description" value="Descripción corta" />
              <TextInput
                id="edit-category-description"
                value={editCategoryShortDescription}
                onChange={(e) => setEditCategoryShortDescription(e.target.value)}
                placeholder="Descripción breve del producto"
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="success" onClick={handleSaveCategoryEdit}>
            Guardar cambios
          </Button>
          <Button color="gray" onClick={handleCloseEditModal}>
            Cancelar
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={Boolean(viewingCategory)} onClose={handleCloseViewModal}>
        <Modal.Header>Detalles de la categoría</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <div>
              <Label htmlFor="view-category-name" value="Nombre de categoría" />
              <TextInput id="view-category-name" value={viewingCategory?.name ?? ""} disabled />
            </div>
            <div>
              <Label htmlFor="view-category-price" value="Precio" />
              <TextInput
                id="view-category-price"
                type="number"
                min="0"
                step="0.01"
                value={viewCategoryPrice}
                onChange={(e) => setViewCategoryPrice(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="view-category-description" value="Descripción corta" />
              <TextInput
                id="view-category-description"
                value={viewCategoryShortDescription}
                onChange={(e) => setViewCategoryShortDescription(e.target.value)}
                placeholder="Descripción breve del producto"
              />
            </div>
            <div>
              <Label htmlFor="view-category-status" value="Estado" />
              <Select
                id="view-category-status"
                value={viewCategoryIsActive ? "active" : "inactive"}
                onChange={(e) => setViewCategoryIsActive(e.target.value === "active")}
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </Select>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="success" onClick={handleSaveCategoryDetails}>
            Guardar detalles
          </Button>
          <Button color="gray" onClick={handleCloseViewModal}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={isCreateModalOpen}
        onClose={() => {
          if (isAddingCategory) return;
          setIsCreateModalOpen(false);
        }}
      >
        <Modal.Header>Crear categoría</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <div>
              <Label htmlFor="create-category-name" value="Nombre de categoría" />
              <TextInput
                id="create-category-name"
                value={createCategoryName}
                onChange={(e) => setCreateCategoryName(e.target.value)}
                placeholder="Ej: tecnología"
              />
            </div>
            <div>
              <Label htmlFor="create-category-emoji" value="Emoji" />
              <div
                id="create-category-emoji"
                className="mt-2 max-h-40 overflow-y-auto rounded-lg border border-gray-200 p-2"
              >
                <div className="grid grid-cols-8 gap-2">
                  {EMOJI_CHOICES.map((emoji) => {
                    const isSelected = createCategoryEmoji === emoji;
                    return (
                      <button
                        key={emoji}
                        type="button"
                        className={`rounded-md border p-2 text-lg transition ${
                          isSelected
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 bg-white hover:bg-gray-50"
                        }`}
                        onClick={() => setCreateCategoryEmoji(emoji)}
                        aria-label={`Seleccionar emoji ${emoji}`}
                      >
                        {emoji}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="create-category-price" value="Precio" />
              <TextInput
                id="create-category-price"
                type="number"
                min="0"
                step="0.01"
                value={createCategoryPrice}
                onChange={(e) => setCreateCategoryPrice(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="create-category-description" value="Descripción corta" />
              <TextInput
                id="create-category-description"
                value={createCategoryShortDescription}
                onChange={(e) => setCreateCategoryShortDescription(e.target.value)}
                placeholder="Descripción breve del producto"
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="success" onClick={handleAddCategory} disabled={isAddingCategory}>
            {isAddingCategory ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Creando...
              </>
            ) : (
              "Crear categoría"
            )}
          </Button>
          <Button color="gray" onClick={() => setIsCreateModalOpen(false)} disabled={isAddingCategory}>
            Cancelar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export { CategoryTable };