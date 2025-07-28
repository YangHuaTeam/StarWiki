<?php
/**
 * UserPageEditProtection
 *
 * @file
 * @ingroup Extensions
 *
 * @license GPL-2.0-or-later
 */

class UserPageEditProtection {

	/**
	 * @param Title $title
	 * @param User $user
	 * @param string $action
	 * @param array|string|MessageSpecifier &$result
	 *
	 * @return bool
	 */
	public static function onGetUserPermissionsErrors( $title, $user, $action, &$result ) {
		global $wgOnlyUserEditUserPage;
		if ( !( $action == 'edit' || $action == 'move' ) ) {
			$result = null;
			return true;
		}
		if ( $title->getNamespace() !== NS_USER ) {
			$result = null;
			return true;
		}
		if ( $wgOnlyUserEditUserPage ) {
			$lTitle = explode( '/', $title->getText() );
			if ( $user->isAllowed( 'editalluserpages' ) || ( $user->getname() == $lTitle[0] ) ) {
				$result = null;
				return true;
			} else {
				$result = false;
				return false;
			}
		}
		$result = null;
		return true;
	}
}
