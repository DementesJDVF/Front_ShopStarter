import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import api from "../../utils/axios";
import { useAuth } from "../../context/AuthContext";
import "./ProductCatalog.css";

type Category = {
    id: number;
    name: string;
};

type Vendor = {
    id: string;
    username: string;
    role: string;
};

export default function AddProduct() {
    const navigate = useNavigate();
    const { t } = useTranslation("product");
    const { user } = useAuth();
    const isAdmin = user?.role === 'ADMIN';

    const [categories, setCategories] = useState<Category[]>([]);
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loadingCats, setLoadingCats] = useState(true);
    const [loadingVendors, setLoadingVendors] = useState(false);

    const [form, setForm] = useState({
        vendor: user?.id || "",
        category: "",
        name: "",
        description: "",
        price: "",
        stock: "",
        status: "PENDING", // Los productos nuevos nacen pendientes de aprobación
        is_featured: false,
        image1_url: "",
        image1_main: true,
        image2_url: "",
        image2_main: false,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        api.get("/products/get-categories/")
            .then((res) => {
                const data = res.data;
                setCategories(Array.isArray(data) ? data : data.results ?? []);
            })
            .catch(() => setCategories([]))
            .finally(() => setLoadingCats(false));
    }, []);

    useEffect(() => {
        if (isAdmin) {
            setLoadingVendors(true);
            api.get("/users/list/")
                .then((res) => {
                    const data = res.data;
                    const all: Vendor[] = Array.isArray(data) ? data : data.results ?? [];
                    setVendors(all.filter((u) => u.role === "VENDEDOR"));
                })
                .catch(() => setVendors([]))
                .finally(() => setLoadingVendors(false));
        }
    }, [isAdmin]);

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) {
        const { name, value, type } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
        }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validación básica
        if (!form.category) { setError("Debes seleccionar una categoría."); setLoading(false); return; }
        if (isAdmin && !form.vendor) { setError("Debes seleccionar un vendedor."); setLoading(false); return; }

        const images: { url_image: string; is_main: boolean }[] = [];
        if (form.image1_url.trim())
            images.push({ url_image: form.image1_url.trim(), is_main: form.image1_main });
        if (form.image2_url.trim())
            images.push({ url_image: form.image2_url.trim(), is_main: form.image2_main });

        const body: Record<string, unknown> = {
            vendor: isAdmin ? form.vendor : user?.id,
            category: Number(form.category),
            name: form.name,
            description: form.description,
            price: form.price,
            stock: form.stock ? Number(form.stock) : 0,
            is_featured: form.is_featured,
            status: "PENDING",
        };
        if (images.length) body.images = images;

        try {
            await api.post("/products/create/", body);

            setSuccess(true);
            setTimeout(() => navigate("/vendedor/manage-products"), 1500);
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.message || t("error");
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="add-product">
            <div className="add-product__header">
                <button className="add-product__back-btn" onClick={() => navigate(-1)}>
                    ← {t("back")}
                </button>
                <h1 className="add-product__title">{t("addTitle")}</h1>
            </div>

            {success && (
                <div className="add-product__alert add-product__alert--success">
                    {t("success")}
                </div>
            )}
            {error && (
                <div className="add-product__alert add-product__alert--error">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="add-product__form">
                <div className="add-product__row">
                        {isAdmin && (
                            <div className="add-product__field">
                                <label className="add-product__label">
                                    {t("vendor")} <span className="add-product__required">*</span>
                                </label>
                                {loadingVendors ? (
                                    <p className="add-product__loading-text">{t("loadingVendors")}</p>
                                ) : (
                                    <select
                                        name="vendor"
                                        value={form.vendor}
                                        onChange={handleChange}
                                        required
                                        title={t("selectVendor")}
                                        className="add-product__input"
                                    >
                                        <option value="">{t("selectVendor")}</option>
                                        {vendors.map((v) => (
                                            <option key={v.id} value={v.id}>{v.username}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        )}

                    <div className="add-product__field">
                        <label className="add-product__label">
                            {t("category")} <span className="add-product__required">*</span>
                        </label>
                        {loadingCats ? (
                            <p className="add-product__loading-text">{t("loadingCategories")}</p>
                        ) : (
                            <select
                                name="category"
                                value={form.category}
                                onChange={handleChange}
                                required
                                title={t("selectCategory")}
                                className="add-product__input"
                            >
                                <option value="">{t("selectCategory")}</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>

                <div className="add-product__field">
                    <label className="add-product__label">
                        {t("name")} <span className="add-product__required">*</span>
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        placeholder={t("namePlaceholder")}
                        className="add-product__input"
                    />
                </div>

                <div className="add-product__field">
                    <label className="add-product__label">
                        {t("description")} <span className="add-product__required">*</span>
                    </label>
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        required
                        rows={3}
                        placeholder={t("descriptionPlaceholder")}
                        className="add-product__input add-product__textarea"
                    />
                </div>

                <div className="add-product__row">
                    <div className="add-product__field">
                        <label className="add-product__label">
                            {t("price")} <span className="add-product__required">*</span>
                        </label>
                        <input
                            type="number"
                            name="price"
                            value={form.price}
                            onChange={handleChange}
                            required
                            min="0.01"
                            step="0.01"
                            placeholder="0.00"
                            className="add-product__input"
                        />
                    </div>
                    <div className="add-product__field">
                        <label className="add-product__label">{t("stock")}</label>
                        <input
                            type="number"
                            name="stock"
                            value={form.stock}
                            onChange={handleChange}
                            min="0"
                            placeholder="0"
                            className="add-product__input"
                        />
                    </div>
                </div>

                <label className="add-product__checkbox-label">
                    <input
                        type="checkbox"
                        name="is_featured"
                        checked={form.is_featured}
                        onChange={handleChange}
                        className="add-product__checkbox"
                    />
                    {t("featuredProduct")}
                </label>

                <div className="add-product__image-box">
                    <label className="add-product__label add-product__label--image">
                        📷 {t("image1")}
                    </label>
                    <input
                        type="url"
                        name="image1_url"
                        value={form.image1_url}
                        onChange={handleChange}
                        placeholder={t("image1Placeholder")}
                        className="add-product__input"
                    />
                    {form.image1_url && (
                        <img
                            src={form.image1_url}
                            alt="preview 1"
                            className="add-product__preview"
                            onError={(e) => (e.currentTarget.style.display = "none")}
                            onLoad={(e) => (e.currentTarget.style.display = "block")}
                        />
                    )}
                    <label className="add-product__checkbox-label add-product__checkbox-label--small">
                        <input
                            type="checkbox"
                            name="image1_main"
                            checked={form.image1_main}
                            onChange={handleChange}
                            className="add-product__checkbox"
                        />
                        {t("mainImage")}
                    </label>
                </div>

                <div className="add-product__image-box">
                    <label className="add-product__label add-product__label--image">
                        📷 {t("image2")}
                    </label>
                    <input
                        type="url"
                        name="image2_url"
                        value={form.image2_url}
                        onChange={handleChange}
                        placeholder={t("image2Placeholder")}
                        className="add-product__input"
                    />
                    {form.image2_url && (
                        <img
                            src={form.image2_url}
                            alt="preview 2"
                            className="add-product__preview"
                            onError={(e) => (e.currentTarget.style.display = "none")}
                            onLoad={(e) => (e.currentTarget.style.display = "block")}
                        />
                    )}
                    <label className="add-product__checkbox-label add-product__checkbox-label--small">
                        <input
                            type="checkbox"
                            name="image2_main"
                            checked={form.image2_main}
                            onChange={handleChange}
                            className="add-product__checkbox"
                        />
                        {t("mainImage")}
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`add-product__submit${loading ? " add-product__submit--loading" : ""}`}
                >
                    {loading ? t("saving") : t("create")}
                </button>
            </form>
        </div>
    );
}