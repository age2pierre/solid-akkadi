/* eslint-disable @typescript-eslint/naming-convention */
export {}
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace SolidAkkadi {
    interface AssetRecord {
      'Animated_Robot.glb': {
        file_extension: '.glb'
        meshes: [
          '__root__',
          'Foot.L',
          'Torso_primitive0',
          'Torso_primitive1',
          'Head_primitive0',
          'Head_primitive1',
          'Head_primitive2',
          'Shoulder.L',
          'Arm.L',
          'Shoulder.R',
          'Arm.R',
          'Leg.L',
          'LowerLeg.L',
          'Leg.R',
          'LowerLeg.R',
          'Foot.R',
          'Hand.R_primitive0',
          'Hand.R_primitive1',
          'Hand.L_primitive0',
          'Hand.L_primitive1',
        ]
        animationGroups: [
          'RobotArmature|Robot_Dance',
          'RobotArmature|Robot_Death',
          'RobotArmature|Robot_Idle',
          'RobotArmature|Robot_Jump',
          'RobotArmature|Robot_No',
          'RobotArmature|Robot_Punch',
          'RobotArmature|Robot_Running',
          'RobotArmature|Robot_Sitting',
          'RobotArmature|Robot_Standing',
          'RobotArmature|Robot_ThumbsUp',
          'RobotArmature|Robot_Walking',
          'RobotArmature|Robot_WalkJump',
          'RobotArmature|Robot_Wave',
          'RobotArmature|Robot_Yes',
        ]
        materials: ['Grey', 'Main', 'Black']
        skeletons: ['skeleton0', 'skeleton1']
        cameras: []
        textures: ['data:EnvironmentBRDFTexture0']
      }
      'Crate.glb': {
        file_extension: '.glb'
        meshes: ['__root__', 'Crate_primitive0', 'Crate_primitive1']
        animationGroups: []
        materials: ['DarkWood', 'Wood']
        skeletons: []
        cameras: []
        textures: ['data:EnvironmentBRDFTexture1']
      }
      'Vulpes_modules.glb': {
        file_extension: '.glb'
        meshes: [
          '__root__',
          'flat_coblblestone',
          'wall_corner_ruined',
          'wall_corner_ruined_ivy',
          'sewer_straight',
          'sewer_corner',
          'sewer_inside_corner',
          'wall_corner',
          'wall_corner_ivy',
          'wall_corner_buttress',
          'wall_corner_touret',
          'wall_corner_touret_ivy',
          'wall_ending_ruined',
          'wall_ending_ruined_ivy',
          'wall_straight',
          'wall_straight_ivy',
          'wall_straight_buttress',
          'wall_tee_ivy',
          'wall_tee',
          'wall_straight_sewer',
          'wall_straight_sewer_ivy',
          'wall_straight_sewer_stairs',
          'wall_straight_door_arch',
          'wall_straight_door_arch_ivy',
        ]
        animationGroups: []
        materials: ['wall_material', 'ivy_material']
        skeletons: []
        cameras: []
        textures: [
          'data:EnvironmentBRDFTexture2',
          'wall_material (Base Color)',
          'ivy_material (Base Color)',
        ]
      }
      'arena.glb': {
        file_extension: '.glb'
        meshes: ['__root__', 'arena', 'ground', 'bridge', 'suzanne']
        animationGroups: []
        materials: ['arena_material', 'ground_material', 'decor_material']
        skeletons: []
        cameras: []
        textures: ['data:EnvironmentBRDFTexture3']
      }
    }
  }
}
