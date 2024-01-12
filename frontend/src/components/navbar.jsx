import React from "react";
import { Link, Box, Flex, Text, Button, Stack, Image, Divider, Menu, MenuItem, MenuButton, MenuList, IconButton, Spacer, Icon } from "@chakra-ui/react";
import { AddIcon, ExternalLinkIcon, RepeatIcon, EditIcon, HamburgerIcon } from '@chakra-ui/icons'
import logo from "../assets/logo-large.png";
import { Avatar, AvatarBadge, AvatarGroup } from '@chakra-ui/react'
import { PiGraph } from "react-icons/pi";
import { TbMathFunction } from "react-icons/tb";

const NavBar = (props) => {
  const [isOpen, setIsOpen] = React.useState(false);

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
    <MenuItem icon={<AddIcon />} command='⌘T'>
      New Graph
    </MenuItem>
    <MenuItem icon={<ExternalLinkIcon />} command='⌘N'>
      Open Graph...
    </MenuItem>
    <MenuItem icon={<RepeatIcon />} command='⌘⇧N'>
      Save
    </MenuItem>
    <MenuItem icon={<EditIcon />} command='⌘O'>
      Open File...
    </MenuItem>
  </MenuList>
</Menu>

const FunctionsMenu = () => <Menu>
<MenuButton
  as={Button}
  aria-label='Functions'
  leftIcon={<Icon as={TbMathFunction} />}
  variant='ghost'
  ml={1}
> 
Functions
</MenuButton>
<MenuList>
  <MenuItem icon={<AddIcon />} command='⌘T'>
    New Function
  </MenuItem>
  <MenuItem icon={<ExternalLinkIcon />} command='⌘N'>
    Open Function Repository...
  </MenuItem>
</MenuList>
</Menu>

  return (
    <NavBarContainer {...props}>
      <Image src={logo} width={120}/>     
      
      <GraphMenu />
      <FunctionsMenu />

      <Spacer />
      <Avatar src="" height={5} width={5} />

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
