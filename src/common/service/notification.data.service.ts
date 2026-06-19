class NotificationDataHandling {

    receiveFriendRequest = (userName: any) => {
        return {
            title: "new friend request for you",
            body: `${userName} send you a friend request`,
        }
    }

    acceptFriendRequest = (userName: any) => {
        return {
            title: "your friend request accepted",
            body: `${userName} accept your friend request`,
        }
    }

    confirmFriendRequest = (userName: any) => {
        return {
            title: "friend request accepted successfully",
            body: `you and ${userName} are friends now`,
        }
    }
}

export default new NotificationDataHandling()