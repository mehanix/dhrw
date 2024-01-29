import {
    Button,
    Modal, ModalBody,
    ModalCloseButton,
    ModalContent, ModalFooter,
    ModalHeader,
    ModalOverlay,
    useDisclosure
} from "@chakra-ui/react";

function VerticallyCenter() {
    const { isOpen, onOpen, onClose } = useDisclosure()

    return (
        <>
            <Button onClick={onOpen}>Trigger modal</Button>

            <Modal closeOnOverlayClick={false} onClose={onClose} isOpen={isOpen} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Modal Title</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                    </ModalBody>
                    <ModalFooter>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}