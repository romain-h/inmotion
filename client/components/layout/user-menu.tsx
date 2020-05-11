import React from 'react';
import { StatefulPopover, PLACEMENT, TRIGGER_TYPE } from 'baseui/popover';
import { StatefulMenu } from 'baseui/menu';
import { Avatar } from 'baseui/avatar';
import { ButtonNude } from 'components/ui/button-nude';

type UserMenuProps = {
  user: {
    name: string;
    picture: string;
  };
  logout: () => void;
};

const UserMenu: React.FC<UserMenuProps> = ({ user, logout }) => {
  return (
    <StatefulPopover
      placement={PLACEMENT.bottomRight}
      triggerType={TRIGGER_TYPE.click}
      dismissOnEsc={true}
      dismissOnClickOutside={true}
      content={({ close }) => (
        <StatefulMenu
          items={[{ label: 'Logout' }]}
          onItemSelect={() => logout()}
        />
      )}
    >
      <ButtonNude>
        <Avatar name={user.name} size="scale1000" src={user.picture} />
      </ButtonNude>
    </StatefulPopover>
  );
};

export default UserMenu;
