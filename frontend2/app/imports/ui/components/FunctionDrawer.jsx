

import { useDisclosure, IconButton, Icon, Card, Heading, CardBody, CardHeader, Divider, CardFooter, ButtonGroup, Spacer, Button, Box, AbsoluteCenter, HStack, Wrap } from "@chakra-ui/react";
import React from 'react';

import { useTracker } from 'meteor/react-meteor-data';
import { motion } from "framer-motion";
import { useState } from "react";
import { TbMathFunction } from "react-icons/tb";
import { Tooltip } from '@chakra-ui/react'
import { ViewIcon, DeleteIcon, AddIcon, CloseIcon } from "@chakra-ui/icons";
import AddFunctionModal from "./AddFunctionModal";
import {FunctionsCollection} from "../../db/FunctionsCollection";
import { IoCodeSlashSharp } from "react-icons/io5";
const FunctionCard = (props) => {
    const funcData = props.function
    const onDragStart = (event) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(funcData));
    event.dataTransfer.effectAllowed = 'move';
  };

  return <Card m="2" onDragStart={(event) => onDragStart(event)} draggable>
    <CardHeader>
      <Heading size="xs">{funcData.name}</Heading>
    </CardHeader>
    <CardBody>
        <Wrap>
            {funcData.description}
        </Wrap>
    </CardBody>
    <Divider />
    <CardFooter>
    <ButtonGroup spacing='2'>
      <Tooltip hasArrow label="View/edit code" aria-label='A tooltip'>
       <IconButton icon={<Icon as={IoCodeSlashSharp} />} variant='solid' colorScheme='blue'/>
      </Tooltip>
      <Tooltip hasArrow label="Delete function" aria-label='A tooltip'>
        <IconButton  onClick={() => {
            Meteor.call('functions.remove', funcData._id)
        }}icon={<DeleteIcon />} variant='solid' colorScheme='red'/>
      </Tooltip>
    </ButtonGroup>
  </CardFooter>
</Card>
}

const FunctionsList = (props) => {
  const functions = props.functions
  if (functions == 0) {
    return <Box p={2}> No functions exist</Box>
  }
  const functionCards = functions.map((func) => <FunctionCard key={func._id} function={func} />)
  return functionCards
}

export default function FunctionDrawer() {
  const { getButtonProps, getDisclosureProps, isOpen } = useDisclosure();
  const [hidden, setHidden] = useState(!isOpen);

    const { functions, isLoading } = useTracker(() => {
        const noDataAvailable = { functions: [] };
        if (!Meteor.user()) {
            return noDataAvailable;
        }
        const handler = Meteor.subscribe('functions');

        if (!handler.ready()) {
            return { ...noDataAvailable, isLoading: true };
        }

        const functions = FunctionsCollection.find({}).fetch();

        return { functions };
    });

  return (
    <div>
      <Tooltip hasArrow placement="left" label="Function repository" aria-label='A tooltip'>
        <IconButton {...getButtonProps()} icon={<Icon as={TbMathFunction}></Icon> }></IconButton>
      </Tooltip>
      <motion.div
        {...getDisclosureProps()}
        hidden={hidden}
        initial={false}
        onAnimationStart={() => setHidden(false)}
        onAnimationComplete={() => setHidden(!isOpen)}
        animate={{ width: isOpen ? 500 : 0 }}
        style={{
          background: "white",
          overflow: "hidden",
          whiteSpace: "nowrap",
          position: "absolute",
          right: "0",
          height: "100vh",
          top: "0",
          padding: "10px",
          border: "1px solid"
        }}
      >
        <HStack>
        <Icon as={TbMathFunction}/>
        <Heading p="2" size='md'> Function Repository</Heading>
        <Spacer />

        <IconButton {...getButtonProps()} variant={"ghost"} icon={<Icon as={CloseIcon}></Icon> }></IconButton>

        </HStack>
      <hr />
          {isLoading ? <div className="loading">loading...</div> : <FunctionsList functions={functions} />}
      <Box style={{ position: "absolute", bottom: "0", padding:"2"}}>
          <AddFunctionModal />

      </Box>
      </motion.div>
    </div>
  );
}


