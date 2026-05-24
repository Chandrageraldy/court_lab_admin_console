import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useProductService } from "../../hooks/useProductService";
import DefaultTextField from "../../components/ui/DefaultTextField";
import DefaultDropdown from "../../components/ui/DefaultDropdown";
import DefaultButton from "../../components/ui/DefaultButton";
import { ArrowLeft, CopyPlus, ImagePlus, Save, X } from "lucide-react";
import RadioGroup from "../../components/ui/RadioGroup";
import { useBrandService } from "../../hooks/useBrandService";
import { useCategoryService } from "../../hooks/useCategoryService";
import type { Category } from "../../types/Category";
import type { Brand } from "../../types/Brand";

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  // ===== Loading States =====
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  // ===== Form States =====
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [sellingPriceDisplay, setSellingPriceDisplay] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [lowStockThreshold, setLowStockThreshold] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [imageUrl, setImageUrl] = useState(""); // for URL input
  const [imageFile, setImageFile] = useState<File | null>(null); // for file upload
  const [imagePreview, setImagePreview] = useState(""); // for preview display
  const [imageUrlValid, setImageUrlValid] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ===== Data States =====
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  // ===== Service Hooks =====
  const productService = useProductService();
  const categoryService = useCategoryService();
  const brandService = useBrandService();

  // ===== Data Fetching =====
  const fetchProduct = async () => {
    setIsLoading(true);
    try {
      const response = await productService.getProductById(Number(id));
      if (response) {
        setName(response.name);
        setDescription(response.description);
        setSellingPrice(String(response.selling_price));
        setSellingPriceDisplay(
          response.selling_price
            ? Number(response.selling_price).toLocaleString("id-ID")
            : "",
        );
        setStockQuantity(String(response.stock_quantity));
        setLowStockThreshold(String(response.low_stock_threshold));
        setCategoryId(String(response.category_id));
        setBrandId(String(response.brand_id));
        setImageUrl(response.image_url);
        setIsActive(response.is_active);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [categoriesRes, brandsRes] = await Promise.all([
        categoryService.getCategories(),
        brandService.getBrands(),
      ]);
      setCategories(categoriesRes);
      setBrands(brandsRes);
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
    }
  };

  // ===== Lifecycle =====
  useEffect(() => {
    fetchDropdownData();
    if (isEditing && id) {
      fetchProduct();
    }
  }, [id]);

  // ===== Action Handlers =====
  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      // TODO: wire up create/update service call
      console.log("Submit", {
        name,
        description,
        sellingPrice,
        stockQuantity,
        lowStockThreshold,
        categoryId,
        brandId,
        imageUrl,
        isActive,
      });
    } catch (error) {
      console.error("Error saving product:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDuplicate = async () => {
    setIsDuplicating(true);
    try {
      // TODO: wire up duplicate service call
      console.log("Duplicate", {
        name,
        description,
        sellingPrice,
        stockQuantity,
        lowStockThreshold,
        categoryId,
        brandId,
        imageUrl,
        isActive,
      });
    } catch (error) {
      console.error("Error saving product:", error);
    } finally {
      setIsDuplicating(false);
    }
  };

  // If file is uploaded, clear image URL
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setImageUrl(""); // 👈 clear URL when file is uploaded
  };

  // If image URL is typed, clear file upload
  const handleImageUrlChange = (value: string) => {
    setImageUrl(value);
    setImageUrlValid(false); // reset valid state on every change
    if (value && imageFile) {
      setImageFile(null);
      setImagePreview("");
    }
  };

  // ===== Helper Functions =====
  const handleSellingPriceChange = (value: string) => {
    // Remove non-numeric characters
    const raw = value.replace(/\D/g, "");
    // sellingPrice is the raw value without formatting, used for saving
    setSellingPrice(raw);
    // Format with commas for display
    setSellingPriceDisplay(raw ? Number(raw).toLocaleString("id-ID") : "");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-4 border-[#d93f1d]/30 border-t-[#d93f1d] animate-spin" />
          <span className="text-sm text-slate-400 tracking-wide">Loading…</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* ── Page Header ─────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/products")}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-2xl font-bold">
              {isEditing ? "Edit Product" : "Add Product"}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {isEditing
                ? "Update the product details below"
                : "Fill in the details to add a new product"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <DefaultButton
            variant="secondary"
            handleClick={handleDuplicate}
            disabled={isDuplicating}
          >
            <CopyPlus className="w-4 h-4" />
            {isDuplicating ? "Duplicating..." : "Duplicate"}
          </DefaultButton>
          <DefaultButton
            variant="primary"
            handleClick={handleSubmit}
            disabled={isSaving}
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save"}
          </DefaultButton>
        </div>
      </div>

      <div className="flex gap-6">
        {/* ── Left Column ─────────────────────────────── */}
        <div className="flex-1 flex flex-col gap-5">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-4">
              Basic Information
            </h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                  Product Name
                </label>
                <DefaultTextField
                  value={name}
                  onChange={setName}
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                  Description
                </label>
                <DefaultTextField
                  value={description}
                  onChange={setDescription}
                  placeholder="Enter product description"
                  isTextArea
                  rows={4}
                />
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-4">
              Product Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                  Category
                </label>
                <DefaultDropdown
                  fullWidth
                  value={categoryId}
                  onChange={setCategoryId}
                  options={[
                    { label: "Select Category", value: "" },
                    ...categories.map((c) => ({
                      label: c.name,
                      value: String(c.category_id),
                    })),
                  ]}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                  Brand
                </label>
                <DefaultDropdown
                  fullWidth
                  value={brandId}
                  onChange={setBrandId}
                  options={[
                    { label: "Select Brand", value: "" },
                    ...brands.map((b) => ({
                      label: b.name,
                      value: String(b.brand_id),
                    })),
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-4">
              Pricing & Stock
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                  Selling Price (IDR)
                </label>
                <DefaultTextField
                  value={sellingPriceDisplay}
                  onChange={handleSellingPriceChange}
                  placeholder="0"
                  type="text"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                  Stock Quantity
                </label>
                <DefaultTextField
                  value={stockQuantity}
                  onChange={setStockQuantity}
                  placeholder="0"
                  type="number"
                  min={0}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                  Low Stock Threshold
                </label>
                <DefaultTextField
                  value={lowStockThreshold}
                  onChange={setLowStockThreshold}
                  placeholder="0"
                  type="number"
                  min={0}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Column ─────────────────────────────── */}
        <div className="w-72 flex flex-col gap-5">
          {/* Status */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Status</h3>
            <RadioGroup
              value={isActive}
              onChange={setIsActive}
              options={[
                {
                  label: "Published",
                  description: "Visible and available for sale.",
                  value: true,
                },
                {
                  label: "Inactive",
                  description: "Hidden and not available for sale.",
                  value: false,
                },
              ]}
            />
          </div>

          {/* Product Image */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-4">
              Product Image
            </h3>
            <div>
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />

              {imagePreview || imageUrl ? (
                <div className="relative">
                  <img
                    src={imagePreview || imageUrl}
                    alt="Product"
                    onLoad={() => setImageUrlValid(true)}
                    onError={() => setImageUrlValid(false)}
                    className={`w-full h-48 object-cover rounded-lg border border-gray-100 ${
                      !imagePreview && !imageUrlValid ? "hidden" : ""
                    }`}
                  />
                  {/* Show placeholder while URL is invalid */}
                  {!imagePreview && !imageUrlValid && (
                    <div className="w-full h-48 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-400">
                      <ImagePlus className="w-8 h-8" />
                      <span className="text-xs font-medium">
                        Waiting for a valid URL...
                      </span>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setImagePreview("");
                      setImageFile(null);
                      setImageUrl("");
                      setImageUrlValid(false);
                    }}
                    className={`absolute top-2 right-2 bg-white rounded-full p-1.5 shadow text-gray-500 hover:text-red-500 transition-colors ${
                      !imagePreview && !imageUrlValid ? "hidden" : ""
                    }`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-48 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-[#F14B27]/40 hover:text-[#F14B27]/60 transition-colors cursor-pointer"
                >
                  <ImagePlus className="w-8 h-8" />
                  <span className="text-xs font-medium">Upload Image</span>
                </div>
              )}

              <div className="mt-3">
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                  Or paste image URL
                </label>
                <DefaultTextField
                  value={imageUrl}
                  onChange={handleImageUrlChange}
                  placeholder="https://..."
                  disabled={!!imageFile}
                />
                {imageFile && (
                  <p className="text-xs text-gray-400 mt-1">
                    Remove uploaded image to use a URL
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
