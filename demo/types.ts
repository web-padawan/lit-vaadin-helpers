export interface User {
  name: {
    first: string;
    last: string;
  };
  location: {
    street: string;
    city: string;
  };
}

export interface HasFilter {
  filter: string;
}
