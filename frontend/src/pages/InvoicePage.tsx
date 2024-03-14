import { useState } from 'react';
import { generatePDF } from '../api-client';
import { useAppContext } from "../context/AppContext";
import { useNavigate } from 'react-router-dom';

interface Product {
  name: string;
  quantity: number;
  rate: number;
}

const ProductPage = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAppContext();

  const [products, setProducts] = useState<Product[]>([{ name: '', quantity: 0, rate: 0 }]);
  const [total, setTotal] = useState<number>(0);

  const handleAddProduct = () => {
    setProducts([...products, { name: '', quantity: 0, rate: 0 }]);
  };

  const handleProductChange = (index: number, field: keyof Product, value: string | number) => {
    const updatedProducts = products.map((product, idx) => {
      if (idx === index) {
        return {
          ...product,
          [field]: value
        };
      }
      return product;
    });
   
    const updatedTotal = updatedProducts.reduce((acc, curr) => {
      return acc + curr.quantity * curr.rate;
    }, 0);

    setTotal(updatedTotal);
    setProducts(updatedProducts);
  };

  const handleRemoveProduct = (index: number) => {
    const removedProduct = products[index];
    const updatedTotal = total - removedProduct.quantity * removedProduct.rate;

    setTotal(updatedTotal);
    setProducts(prevProducts => prevProducts.filter((_, i) => i !== index));


  };

  const generateHTML = () => {
    let html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice</title>
        <!-- Include Tailwind CSS -->
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
      </head>
      <body>
        <div class="container mx-auto p-4">
          <table class="text-gray-700 border-none mt-20 table-auto w-full">
            <thead>
              <tr class='text-lg'>
                <th class="px-4 pb-6 border-b py-2">Product</th>
                <th class="px-4 pb-6 border-b py-2">Qty</th>
                <th class="px-4 pb-6 border-b py-2">Rate</th>
                <th class="px-4 pb-6 border-b py-2">Total</th>
              </tr>
            </thead>
            <tbody class='text-gray-700 font-semibold text-lg'>
    `;
    products.forEach((product, _index) => {
      const productTotal = product.quantity * product.rate;
      html += `
              <tr >
                <td class="text-thin mt-2 text-center px-4 py-6">
                  ${product.name}
                </td>
                <td class="text-blue-500 text-thin text-center px-4 py-6">
                  ${product.quantity}
                </td>
                <td class="text-thin text-center  px-4 py-6">
                  ${product.rate}
                </td>
                <td class="text-thin text-center px-4 py-6">
                  INR ${productTotal}
                </td>
              </tr>
      `;
    });
    html += `
            </tbody>
          </table>
          <div class='flex justify-end'>
            <div class="text-gray-600 px-20 flex flex-col text-md ">
              <div class="flex justify-between font-bold mt-10 mb-2">
                Total <span class='ml-40'>INR ${total}</span>
              </div>
              <div class="flex justify-between font-bold mt-8">GST <span>18%</span></div>
              <div class="flex justify-between font-bold mt-8 mb-2 border-b border-t border-x-0 text-black pt-2 pb-2">Grand Total <span class='text-blue-500'>₹ ${total + (total * 0.18)}</span></div>
            </div>   
          </div>
          <p class="text-gray-700 mt-4 ml-4">Valid until: ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
        </div>
       
    `;
    html += `
    <footer class=" rounded-full bottom-10 bg-gradient-to-b from-gray-800 to-black absolute left-12 ml-5 w-5/6">
     <div class="px-8 py-4 mx-8">
    <p class="text-sm text-white font-semibold">Terms and Conditions</p>
      <p class="text-sm text-white">we are happy to supply any durther information you may need and trust that you call on us to fill your order.
      which will receive our prompt and careful attention</p>
      <div/>
    </footer>
    </body>
    </html>
    `
    return html;
  };




  const handleGeneratePDF = () => {
    const htmlContent = generateHTML(); 
    generatePDF(htmlContent); 
  };

  if (isLoggedIn) {
    return (
      <div className=" container mx-auto p-4">
       
        <button className=" left-0 bg-blue-500 text-white px-4 py-2 mb-4 rounded-md items-center  font-bold hover:bg-black" onClick={handleAddProduct}>Add Product</button>
        <table className=" text-gray-700 border-none top-20 table-auto w-full">
          <thead>
            <tr className='text-2xl ' >
              <th className="px-4 pb-6 border-b py-2">Product</th>
              <th className="px-4 pb-6 border-b py-2">Qty</th>
              <th className="px-4 pb-6 border-b py-2">Rate</th>
              <th className="px-4 pb-6 border-b py-2">Total</th>
            </tr>
          </thead>
          <tbody className='text-gray-700 font-semibold text-xl'>
            {products.map((product, index) => (
              <tr key={index}>
                <td className=" px-4 py-2">
                  <input
                    type="text"
                    value={product.name}
                    className="text-center "
                    placeholder="Product Name"
                    onChange={e => handleProductChange(index, 'name', e.target.value)}
                  />
                </td >
                <td className=" px-4 py-2">
                  <input
                    type="number"
                    value={product.quantity}
                    className="text-center text-blue-500"
                    placeholder="Product Quantity"
                    onChange={e => handleProductChange(index, 'quantity', parseInt(e.target.value))}
                  />
                </td>
                <td className=" px-4 py-2">
                  <input
                    type="number"
                    className="text-center "
                    value={product.rate}
                    placeholder="Product Rate"
                    onChange={e => handleProductChange(index, 'rate', parseInt(e.target.value))}
                  />
                </td>
                <td className=" text-center px-4 py-2">
                  INR {product.quantity * product.rate}
                </td>
                <td className="flex justify-end px-4 py-7">
                  <button onClick={() => handleRemoveProduct(index)} className="bg-red-500 rounded-md hover:bg-red-300 text-white px-6  py-2">Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className='flex justify-end'>
          <div className="text-gray-600 px-7 flex flex-col text-xl ">
            <div className="flex justify-between font-bold mt-10 mb-2">
              Total <span className='ml-80'>INR {total}</span>
            </div>
            <div className="flex justify-between font-bold mt-10">GST <span>18%</span></div>
            <div className="flex justify-between font-bold mt-10 mb-2 border-b border-t border-x-0  pt-10 pb-10">Grand Total <span className='text-blue-500'>₹ {total + (total * 0.18)}</span></div>
          </div>
        </div>
        <button onClick={handleGeneratePDF} className=" left-0 bg-blue-500 text-white px-4 py-2 mb-4 rounded-md items-center  font-bold hover:bg-black">Generate PDF</button>
      </div>
    )
  } else {
    navigate("/");
    return null;
  }
}

export default ProductPage;
