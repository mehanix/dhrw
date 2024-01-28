import React, { useState, useRef, useCallback } from 'react';

import {  MenuItem, useDisclosure, Button, Modal, ModalOverlay, ModalCloseButton, ModalContent, ModalHeader, ModalFooter, ModalBody } from "@chakra-ui/react";
import { ExternalLinkIcon } from '@chakra-ui/icons'
import Overview from "../routes/ManageGraphs";
export default function GraphCollection() {
    const { isOpen, onOpen, onClose } = useDisclosure()
  
    return (
      <>
        <MenuItem onClick={onOpen} icon={<ExternalLinkIcon />} command='⌘N'>
        Manage Graphs...
        </MenuItem> 
        <Modal size='full' onClose={onClose} isOpen={isOpen} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Your Computation Graphs</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Overview />
            </ModalBody>
          </ModalContent>
        </Modal>
      </>
    )
  }

