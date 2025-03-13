import { useEffect, useState } from 'react';
import { Item, fetchItems, deleteItem, fetchSearchItems } from '~/api';

// const PLACEHOLDER_IMAGE = import.meta.env.VITE_FRONTEND_URL + '/logo192.png';

interface Prop {
  reload: boolean;
  onLoadCompleted: () => void;
}  

export const ItemList = ({ reload, onLoadCompleted }: Prop) => {
  const [items, setItems] = useState<Item[]>([]);
  const [searchObj, setSearchObj] = useState<{name: string}>({name: ""});
  const [searchItems, setSearchItems] = useState<Item[]>([]);

  useEffect(() => {
    // fetchData関数の定義
    const fetchData = () => {
      fetchItems()
        .then((data) => {
          console.debug('GET success:', data);
          setItems(data.items);
          onLoadCompleted();
        })
        .catch((error) => {
          console.error('GET error:', error);
        });
    };

    // reloadがTrueの時に実行
    if (reload) {
      fetchData();
    }
  }, [reload, onLoadCompleted]);// reload, onLoadCompletedの値が変わるたびに実行する

  const handleDelete = async (id: number) => {
    deleteItem(id).then(response => {
      if (!response.ok) {
        throw new Error(`Failed to delete item ${id}`);
      }
      setItems(items.filter(item => item.id !== id));
    }).catch(error => console.error("Error deleting item:", error));
  };

  const handleSearch = async (name: string) => {
    fetchSearchItems(name).then( (data) => {
      setSearchItems(data.items);
      onLoadCompleted();
    }).catch((error) => {
      console.error('GET error:', error);
    });
  };

  const onValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchObj(prev => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  return (
    <>
      <div className='Search'>
        <form>
          <input 
            type='text'
            name='name'
            placeholder='name'
            value={searchObj.name}
            onChange={onValueChange}/>
          <button type='button' onClick={() => handleSearch(searchObj.name)}>Search</button>
        </form>
      </div>
      <div className='itemlist-container'>
        {items.map((item) => {
          // specify image's url of the item
          const imageUrl = import.meta.env.VITE_BACKEND_URL + "/image/" + item.image_name;
          
          return (
            <div key={item.id} className="ItemList">
              {/* TODO: Task 2: Show item images */}
              <button className="delete-button" onClick={()=>handleDelete(item.id)}>🗑️</button>
              <img src={imageUrl} className='item-image'/>
              <p className='name-category'>
                <span >Name: {item.name}</span>
                <br />
                <span>Category: {item.category}</span>
              
              </p>
            </div>
          );
          }
        )}
      </div>
    </>
    
  );
};
