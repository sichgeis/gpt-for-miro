import {FrameProps, StickyNote, StickyNoteProps} from "@mirohq/websdk-types";

const getCenterOfGravity = async (items: any[]) => {
    if (items.length === 0) {
        return await miro.board.viewport.get().then(value => {
            return {x: value.x + value.width / 2, y: value.y + value.height / 2}
        })
    }

    const xPromises = items.map(async (item) => {
        const parentNode = item.parentId ? await miro.board.getById(item.parentId) : null;

        if (parentNode && parentNode.type === 'frame') {
            return await projectLocalToGlobalCoord(parentNode, item);
        } else {
            return {x: item.x, y: item.y};
        }
    });

    const xValues = await Promise.all(xPromises);

    return xValues.reduce((acc, val) => {
        return {
            x: acc.x + val.x / items.length,
            y: acc.y + val.y / items.length
        };
    }, {x: 0, y: 0});
}

const findParentId = (items: any[]) => {
    for (let i = 0; i < items.length; i++) {
        if (items[i].hasOwnProperty('parentId') && items[i]['parentId'] !== null) {
            return items[i]['parentId'];
        }
    }
    return undefined;
}

const getHeight = (items: StickyNote[] | StickyNote) => {
    items = (!Array.isArray(items)) ? [items] : items;

    const defaultHeight = 100;
    if (!items || items.length === 0) return defaultHeight;

    let minY = Infinity;
    let maxY = -Infinity;

    items.forEach((item) => {
        let top = item.y;
        let bottom = item.y + item.height;
        minY = Math.min(minY, top);
        maxY = Math.max(maxY, bottom);
    });

    return maxY - minY;
}

const addSticky = (content: string, height: number, position: { x: number, y: number }) => {
    miro.board.createStickyNote({
        content,
        height,
        shape: 'rectangle',
        x: position.x,
        y: position.y,
    });
}

const projectLocalToGlobalCoord = async (frame: FrameProps | undefined, coord: StickyNoteProps) => {
    if (!frame || frame.x === undefined || frame.width === undefined || frame.y === undefined || frame.height === undefined) {
        return coord;
    } else {
        return {
            x: (frame.x - frame.width / 2) + coord.x,
            y: (frame.y - frame.height / 2) + coord.y,
        };
    }
};

export {getCenterOfGravity, getHeight, addSticky, projectLocalToGlobalCoord, findParentId};