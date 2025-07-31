import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from '@chatscope/chat-ui-kit-react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';

const ChatComponent = ({messages, isTyping, handleSend}) => {
    return (
        <div className="chat-container">
            <MainContainer>
                <ChatContainer>
                    <MessageList
                        scrollBehavior="smooth"
                        typingIndicator={isTyping ? <TypingIndicator content="Assistant is typing" /> : null}
                    >
                        {messages?.map((msg, i) => (
                            <Message key={i} model={msg}>
                                <Message.Footer sender={msg.sender} />
                            </Message>
                        ))}
                    </MessageList>
                    <MessageInput
                        placeholder="Ask about the PDF..."
                        onSend={handleSend}
                        attachButton={false}
                    />
                </ChatContainer>
            </MainContainer>
        </div>
    )
}

export default ChatComponent;