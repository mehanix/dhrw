import React from "react";
import { Link, Box, Flex, Text, Button, Stack, Image, Divider, Menu, MenuItem, MenuButton, MenuList, IconButton, Spacer, Icon } from "@chakra-ui/react";
import { AddIcon, ExternalLinkIcon, RepeatIcon, EditIcon, HamburgerIcon } from '@chakra-ui/icons'
// import logo from "../assets/logo-large.png";
import { Avatar, AvatarBadge, AvatarGroup } from '@chakra-ui/react'
import { PiGraph } from "react-icons/pi";
import { TbMathFunction } from "react-icons/tb";
import GraphCollection from './GraphCollection.jsx';
import { useToast } from "@chakra-ui/react";
import FunctionDrawer from "./FunctionDrawer";
import AddGraphModal from "./AddGraphModal";
const NavBar = (props) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const toast = useToast()
  const logout = () => {
    Meteor.logout()
  }
  const toggle = () => setIsOpen(!isOpen);

  const GraphMenu = () => <Menu>
  <MenuButton
    as={Button}
    aria-label='Graph'
    leftIcon={<Icon as={PiGraph} />}
    variant='ghost'
    ml={3}
  > 
  Graph
  </MenuButton>
  <MenuList>
    <AddGraphModal setWorkingGraph={props.setWorkingGraph}/>
    <GraphCollection/>
    <MenuItem  onClick={() =>
        toast({
          title: 'Saved',
          description: "Progress saved!",
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      } icon={<RepeatIcon />}>
      Save
    </MenuItem>
  </MenuList>
</Menu>

const LogoutMenu = () => <Menu>
<MenuButton
  as={Avatar}
  src="" height={5} width={5}
  leftIcon={<Icon as={TbMathFunction} />}
  variant='ghost'
  ml={1}
> 
</MenuButton>
<MenuList>
  <MenuItem onClick={logout}>
    Log Out
  </MenuItem>
</MenuList>
</Menu>

  return (
    <NavBarContainer {...props}>
      {/* <Image src={logo} width={120}/>      */}

      <GraphMenu/>

      <Spacer />
      <LogoutMenu />
  </NavBarContainer>
  );
};

const NavBarContainer = ({ children, ...props }) => {
  return (<>
    <Flex
      as="nav"
      align="center"
      justify="start"
      wrap="nowrap"
      w="100%"
      p={2}
      pb={2}
      pl={4}
      pr={4}
      bg={["primary.500", "primary.500", "transparent", "transparent"]}
      color={["white", "white", "black", "black"]}
      {...props}
    >
      {children}
    </Flex>
    <Divider />
    </>
  );
};

export default NavBar;
