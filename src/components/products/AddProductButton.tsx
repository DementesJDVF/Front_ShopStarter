import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

export function AddProductButton() {
    const navigate = useNavigate();
    const { t } = useTranslation("product");

    return (
        <button
            className="add-product-btn"
            onClick={() => navigate("/products/add")}
            title={t("addBtnTitle")}
        >
            +
        </button>
    );
}