import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { Product } from "../../types/Product";
import { useProductService } from "../../hooks/useProductService";

const ProductForm = () => {
  const { id } = useParams();
  const isEditing = !!id;

  const [isLoading, setIsLoading] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);

  const productService = useProductService();

  useEffect(() => {
    if (isEditing && id) {
      // fetchProduct();
    }
  }, [id]);

  // const fetchProduct = async () => {
  //   setIsLoading(true);
  //   try {
  //     const response = await productService.getProductById(Number(id));
  //     setProduct(response);
  //   } catch (error) {
  //     console.error("Error fetching product:", error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  return <div>{/* your form content */}</div>;
};

export default ProductForm;
