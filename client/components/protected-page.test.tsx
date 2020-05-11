import React from 'react';
import { shallow } from 'enzyme';
import ProtectedPage from './protected-page';
import { useAuth, Auth0ContextProps } from 'lib/hooks/auth';

jest.mock('lib/hooks/auth');
const mockedUseAuth = useAuth as jest.Mock<Auth0ContextProps>;

describe('ProtectedPage', () => {
  const DEFAULT_MOCK = {
    isAuthenticated: false,
    user: {},
    isLoading: false,
    isPopupOpen: false,
    loginWithPopup: () => {},
    handleRedirectCallback: () => {},
    getIdTokenClaims: () => {},
    loginWithRedirect: () => {},
    getTokenSilently: () => {},
    getTokenWithPopup: () => {},
    logout: () => {},
  };

  it('renders the main header and no children', () => {
    mockedUseAuth.mockReturnValue({
      ...DEFAULT_MOCK,
    });
    const wrapper = shallow(
      <ProtectedPage>
        <p>Hello Jest!</p>
      </ProtectedPage>,
    );
    expect(wrapper.find('Header')).toHaveLength(1);
    expect(wrapper.find('p')).toHaveLength(0);
  });

  describe('when a user is logged in', () => {
    it('renders page content', () => {
      mockedUseAuth.mockReturnValue({
        ...DEFAULT_MOCK,
        isAuthenticated: true,
      });

      const wrapper = shallow(
        <ProtectedPage>
          <p>Hello Jest!</p>
        </ProtectedPage>,
      );

      expect(wrapper.find('Header')).toHaveLength(0);
      expect(wrapper.find('p')).toHaveLength(1);
    });
  });
});
