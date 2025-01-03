export type PopulatedPlayerWithTeam = {
  id: string;
  name: string;
  imgUrl?: string;
  team: {
    id: string;
    name: string;
    imgUrl?: string;
  };
};
