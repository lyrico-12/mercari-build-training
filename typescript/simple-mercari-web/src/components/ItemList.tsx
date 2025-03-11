import { useEffect, useState } from 'react';
import { Item, fetchItems } from '~/api';

// const PLACEHOLDER_IMAGE = import.meta.env.VITE_FRONTEND_URL + '/logo192.png';

interface Prop {
  reload: boolean;
  onLoadCompleted: () => void;
}  

export const ItemList = ({ reload, onLoadCompleted }: Prop) => {
  const [items, setItems] = useState<Item[]>([]);
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

  return (
    <div className='itemlist-container'>
      {items.map((item) => {
        // specify image's url of the item
        const imageUrl = import.meta.env.VITE_BACKEND_URL + "/image/" + item.image_name;
        return (
          <div key={item.id} className="ItemList">
            {/* TODO: Task 2: Show item images */}
            <img src={imageUrl} className='item-image'/>
            <p className='name-category'>
              <span >Name: {item.name}</span>
              <br />
              <span>Category: {item.category}</span>
            
            </p>
          </div>
        );
      })}
    </div>
  );
};
