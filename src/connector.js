/**
 * Get Video element from page
 */
export function getVideo() {
	return document.getElementsByTagName("video")[0]
}

export function videoLoaded(records, observer) {
	for (const record of records) {
		for (const addedNode of record.addedNodes) {
			if (addedNode.tagName == "VIDEO") {
				console.log("Added node", addedNode.tagName)
				const event = new Event("newVideo");
				dispatchEvent(event);
				observer.disconnect();
			}

		}
	}
}

export const observerOptions = {
	childList: true,
	subtree: true,
};


