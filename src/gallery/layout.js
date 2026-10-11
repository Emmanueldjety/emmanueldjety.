// Dimensions des salles (en mètres) et position des objets sur les murs.
export const ROOM = { w: 26, d: 18, h: 5 }

// Les portes sont toujours sur le mur de droite, à ces positions.
export const DOOR_Z = [-5, 0, 5]

// Place un objet sur un mur : `along` = position le long du mur, `y` = hauteur du centre.
export function wallPose(wall, along, y = 2.25) {
  const { w, d } = ROOM
  const e = 0.02
  switch (wall) {
    case 'back':
      return { position: [along, y, -d / 2 + e], rotation: [0, 0, 0] }
    case 'front':
      return { position: [along, y, d / 2 - e], rotation: [0, Math.PI, 0] }
    case 'left':
      return { position: [-w / 2 + e, y, along], rotation: [0, Math.PI / 2, 0] }
    default:
      return { position: [w / 2 - e, y, along], rotation: [0, -Math.PI / 2, 0] }
  }
}
