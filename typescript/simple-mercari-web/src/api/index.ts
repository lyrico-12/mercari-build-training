const SERVER_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:9000';

export interface Item {
  id: number;
  name: string;
  category: string;
  image_name: string;
}

export interface ItemListResponse {
  items: Item[];
}

export const fetchItems = async (): Promise<ItemListResponse> => {
  // responses from /items endpoint and /categories endpoint
  const [itemsResponse, categoriesResponse] = await Promise.all([ // Promiseall enables to fetch multiple response
    fetch(`${SERVER_URL}/items`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }), 
    fetch(`${SERVER_URL}/categories`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })
  ]);

  const itemsData = await itemsResponse.json();
  const categoriesData = await categoriesResponse.json();

  // map category_id to category_name
  const categoryMap: Record<number, string> = {};
  categoriesData.categories.forEach((category: {id: number; name: string}) => {
    categoryMap[category.id] = category.name;
  });

  // create response to correctly show name of the category 
  const response = itemsData.items.map((item: {id: number; name: string; category_id: number, image_name: string}) => ({
    id: item.id,
    name: item.name,
    category: categoryMap[item.category_id],
    image_name: item.image_name,
  }));

  return {"items": response};
};


export const fetchSearchItems = async (name: string): Promise<ItemListResponse> => {
  const query = encodeURIComponent(name);
  const response = await fetch(`${SERVER_URL}/search?keyword=${query}`, {
    method: 'GET',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  if (response.status >= 400) {
    throw new Error('Failed to fetch items from the server');
  }
  return response.json();
};

export interface CreateItemInput {
  name: string;
  category: string;
  image: string | File;
}

export const postItem = async (input: CreateItemInput): Promise<Response> => {
  const data = new FormData();
  data.append('name', input.name);
  data.append('category', input.category);
  data.append('image', input.image);
  const response = await fetch(`${SERVER_URL}/items`, {
    method: 'POST',
    mode: 'cors',
    body: data,
  });
  return response.json();
};

export const deleteItem = async (id: number): Promise<Response> => {
  const response = await fetch(`${SERVER_URL}/items/${id}`, {
    method: 'DELETE',
    mode: 'cors',
  });
  return response
}