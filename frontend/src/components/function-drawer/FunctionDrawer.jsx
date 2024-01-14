
import { useDisclosure, IconButton, Icon, Card, Heading, CardBody, CardHeader, Divider, CardFooter, ButtonGroup, Spacer, Button, Box, AbsoluteCenter, HStack  } from "@chakra-ui/react";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from 'react';

import { motion } from "framer-motion";
import { useState } from "react";
import { TbMathFunction } from "react-icons/tb";
import { Tooltip } from '@chakra-ui/react'
import { ViewIcon, DeleteIcon, AddIcon, CloseIcon } from "@chakra-ui/icons";
const FunctionCard = (props) => {
  const onDragStart = (event, nodeType) => {
    console.log(nodeType)
    event.dataTransfer.setData('application/reactflow', {'label':props.function.name});
    event.dataTransfer.effectAllowed = 'move';
  };

  const func = props.function
  return <Card m="2" onDragStart={(event) => onDragStart(event, func.name)} draggable>
    <CardHeader>
      <Heading size="xs">{func.name}</Heading>
    </CardHeader>
    <CardBody>
    {func.description}
    </CardBody>
    <Divider />
    <CardFooter>
    <ButtonGroup spacing='2'>
      <Tooltip hasArrow label="View/edit code" aria-label='A tooltip'>
       <IconButton icon={<ViewIcon />} variant='solid' colorScheme='blue'/>
      </Tooltip>
      <Tooltip hasArrow label="Delete function" aria-label='A tooltip'>
        <IconButton icon={<DeleteIcon />} variant='solid' colorScheme='red'/>
      </Tooltip>
    </ButtonGroup>
  </CardFooter>
</Card>
  return 
}

const FunctionsList = (props) => {
  const functions = props.functions
  const functionCards = functions.map((func) => <FunctionCard function={func} />)
  return functionCards
}

export default function App() {
  const { getButtonProps, getDisclosureProps, isOpen } = useDisclosure();
  const [hidden, setHidden] = useState(!isOpen);


  const dispatch = useDispatch();
  const functions = useSelector((state) => state.FunctionRepository);
  
  useEffect(() => {
    dispatch.FunctionRepository.getFunctionRepository()
  }, []);

  if (functions == 0) {
    console.log("Loading")
    return <p>Loading...</p>
  }

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
        <FunctionsList functions={functions} />
      <Box style={{ position: "absolute", bottom: "0", padding:"2"}}>
        <IconButton variant="outline" icon={<Icon as={AddIcon}></Icon> }></IconButton>
      </Box>
      {/* <div className="dndnode input" onDragStart={(event) => onDragStart(event, 'input')} draggable>
        Input Node
      </div>
      <div className="dndnode" onDragStart={(event) => onDragStart(event, 'default')} draggable>
        Default Node
      </div>
      <div className="dndnode output" onDragStart={(event) => onDragStart(event, 'output')} draggable>
        Output Node
      </div> */}
      </motion.div>
    </div>
  );
}


// import React from 'react';
// export default () => {
//   const onDragStart = (event, nodeType) => {
//     event.dataTransfer.setData('application/reactflow', nodeType);
//     event.dataTransfer.effectAllowed = 'move';
//   };

//   return (

//   );
// // };
