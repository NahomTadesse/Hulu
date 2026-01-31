import { useEffect, useState } from "react";
import {
  createCategory,
  deleteCategory,
  getAllCategory,
  updateCategory,
} from "../../lib/api.ts";
import {  Plus } from "lucide-react";
// const Modal = ({ isOpen, onClose, children, title }: { isOpen: boolean; onClose: () => void; children: React.ReactNode; title: string; }) => {
//   if (!isOpen) return null;
//
//   return (
//       <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//         <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
//           <div className="flex justify-between items-center mb-4">
//             <h2 className="text-xl font-bold">{title}</h2>
//             <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
//           </div>
//           {children}
//         </div>
//       </div>
//   );
// };

const Modal = ({ isOpen, onClose, children, title, className }: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
  // 1. Accept the className prop
  className?: string;
}) => {
  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        {/* 2. Apply the className prop here (using default styles as a fallback/base) */}
        <div className={`bg-white p-6 rounded-lg shadow-xl max-w-sm w-full ${className}`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{title}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
          </div>
          {children}
        </div>
      </div>
  );
};

type TFormValue = {
  name: string;
  id?: number;
};
export function CategoryPage() {
  const [categories, setCategories] = useState<TFormValue[]>([]);
  const [editCategory, setEditCategory] = useState<TFormValue | undefined>(
      undefined
  );
  const [isModalOpen, setIsModalOpen] = useState(false); // New state for modal visibility
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const getCategories = async () => {
    try {
      const response = await getAllCategory();
      console.log(response);
      if (response.status === 200) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

  const handleAddCategory = () => {
    setEditCategory(undefined);
    setIsModalOpen(true);
  };


  const handleCloseModal = () => {
    setEditCategory(undefined);
    setIsModalOpen(false);
  };

  const showMessage = (msg: any, error = false) => {
    setMessage(msg);
    setIsError(error);
    setTimeout(() => {
      setMessage("");
      setIsError(false);
    }, 4000);
  };

  const handleEditClick = (category: TFormValue) => {
    setEditCategory(category);
    setIsModalOpen(true);
  };

  // Combined submit logic
  const handleSubmit = async () => {
    try {
      if (editCategory && editCategory.id) {
        const model = {
          id: editCategory.id,
          name: editCategory.name,
        }
      const response = await updateCategory(editCategory.id, model);
        showMessage(response.data.message, false);
      } else {
        const model = {

          name: editCategory?.name,
        }
        const response =  await createCategory(model);
        showMessage(response.data.message, false);
      }
     // handleCloseModal();
    //  await getCategories();
    } catch (error:any) {
      console.log("Submit error:", error);
      showMessage(
          error.response?.data?.message || "Error Getting Products: " + error,
          true
      );
    }
  };





  return (
      <div className="inventory-container">
        {/* Header */}
        <div className="inventory-header">
          <div>
            <h1 className="inventory-title">
              Categories
            </h1>
            <p className="inventory-subtitle">
              Category List
            </p>
          </div>
          <button
              onClick={handleAddCategory}
              className="inventory-add-btn"
          >
            <Plus className="w-5 h-5"/>
            <span>Add New Category</span>
          </button>

        </div>
        {message && (
            <div
                className={`mb-6 p-4 rounded-lg font-medium text-center ${
                    isError
                        ? "bg-red-100 text-red-700 border border-red-300"
                        : "bg-green-100 text-green-700 border border-green-300"
                }`}
            >
              {message}
            </div>
        )}



        <div>
          {categories && (
              <ul className="space-y-2">
                {categories.map((category) => (
                    <li
                        className="flex justify-between items-center bg-white p-4 rounded-lg shadow"
                        key={category?.id}
                        style={{
                          border:
                              editCategory?.id === category?.id ? `2px solid green` : "",
                        }}
                    >
                      <div className="flex gap-2">
                        <span className="font-medium ml-2">{category?.id}.</span>
                        <span className="font-medium">{category?.name}</span>
                      </div>

                      <div className="space-x-2">

                        <button
                            onClick={() => handleEditClick(category)} // Use new handler
                            className="text-blue-600 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                            onClick={async () => {
                              await deleteCategory(category?.id);
                              await getCategories();
                            }}
                            className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                ))}
              </ul>
          )}
        </div>


        <Modal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            title={editCategory?.id ? "Edit Category" : "Add New Category"}
            className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 mx-auto"
        >
          <form onSubmit={handleSubmit} className="space-y-6 flex flex-col">


            <div className="grid grid-flow-col grid-rows-3 gap-4">
              <div className="row-span-3 ...">
              <label className="block text-gray-700 font-semibold mb-2">
                Category Name
              </label>
              <input
                  value={editCategory?.name || ""}
                  onChange={(e) =>
                      setEditCategory({...editCategory, name: e.target.value})
                  }
                  required
                  type="text"
                  className=" p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-800"
                  style={{minWidth: "240px"}} // <-- For a wider text box on top of w-full
                  placeholder="Enter category name"
              />
            </div>
            </div>

            <div className="col-span-2 row-span-2 ...">
              <button
                  type="submit"
                  className="w-full bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 transition-colors duration-200 font-semibold"
                  style={{minWidth: "200px"}}
              >
                {editCategory?.id ? "Save Changes" : "Create Category"}
              </button>
            </div>
          </form>
        </Modal>


      </div>
  );
}





